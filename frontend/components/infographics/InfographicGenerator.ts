/**
 * Enhanced Infographic Generator
 * Uses Chrome's Built-in AI (Gemini Nano) for smart image analysis & summarization.
 * Falls back to Tesseract.js OCR + naive summarizer if Gemini Nano is unavailable.
 */
import Tesseract from 'tesseract.js';

// ─── Types ───────────────────────────────────────────────────────
interface ContentBlock {
    type: 'question' | 'concept' | 'list';
    title: string;
    items: string[];
}

interface AnalysisResult {
    title: string;
    mainIdea: string;
    blocks: ContentBlock[];
}

// ─── Colors ──────────────────────────────────────────────────────
const ACCENTS = ['#4ECDC4', '#45B7D1', '#FF6B6B', '#FFE66D', '#96E6A1', '#C77DFF'];

// ─── Gemini Nano (Chrome Built-in AI) ────────────────────────────
async function isNanoAvailable(): Promise<boolean> {
    try {
        // Modern API: LanguageModel global
        if (typeof (globalThis as any).LanguageModel !== 'undefined') {
            const caps = await (globalThis as any).LanguageModel.capabilities();
            return caps.available === 'readily' || caps.available === 'after-download';
        }
        // Legacy: window.ai
        if ((window as any).ai?.languageModel) {
            const caps = await (window as any).ai.languageModel.capabilities();
            return caps.available === 'readily' || caps.available === 'after-download';
        }
    } catch { /* not available */ }
    return false;
}

async function createNanoSession(): Promise<any> {
    const systemPrompt = `You are a study assistant. Given text extracted from educational material, analyze it and produce a structured JSON summary. Output ONLY valid JSON, no markdown.

Format:
{
  "title": "Short chapter/topic title",
  "mainIdea": "1-2 sentence overview",
  "blocks": [
    { "type": "concept", "title": "Key Concept Name", "items": ["Explanation point 1", "Point 2"] },
    { "type": "question", "title": "What is X?", "items": ["Concise answer"] },
    { "type": "list", "title": "Important Points", "items": ["Point 1", "Point 2", "Point 3"] }
  ]
}

Rules:
- Maximum 6 blocks
- Maximum 4 items per block
- Keep items concise (under 100 characters)
- Use "question" type for Q&A pairs
- Use "concept" type for definitions/explanations
- Use "list" type for grouped facts/points`;

    try {
        if (typeof (globalThis as any).LanguageModel !== 'undefined') {
            return await (globalThis as any).LanguageModel.create({ systemPrompt });
        }
        if ((window as any).ai?.languageModel) {
            return await (window as any).ai.languageModel.create({ systemPrompt });
        }
    } catch (e) {
        console.warn('Failed to create Nano session:', e);
    }
    return null;
}

async function analyzeWithNano(text: string): Promise<AnalysisResult | null> {
    const session = await createNanoSession();
    if (!session) return null;

    try {
        const prompt = `Analyze this educational text and create a structured summary:\n\n${text.slice(0, 3000)}`;
        const response = await session.prompt(prompt);

        // Parse JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return null;

        const parsed = JSON.parse(jsonMatch[0]);
        if (!parsed.title || !parsed.blocks) return null;

        // Validate and clean
        return {
            title: String(parsed.title).slice(0, 60),
            mainIdea: String(parsed.mainIdea || '').slice(0, 200),
            blocks: (parsed.blocks as any[]).slice(0, 6).map((b: any) => ({
                type: ['question', 'concept', 'list'].includes(b.type) ? b.type : 'list',
                title: String(b.title || 'Key Points').slice(0, 80),
                items: (b.items || []).slice(0, 4).map((i: any) => String(i).slice(0, 120)),
            })),
        };
    } catch (e) {
        console.warn('Nano analysis failed:', e);
        return null;
    } finally {
        session.destroy?.();
    }
}

// ─── OCR Fallback ────────────────────────────────────────────────
async function extractTextFromImages(files: File[], onProgress?: (p: number, msg: string) => void): Promise<string> {
    let combined = '';
    for (let i = 0; i < files.length; i++) {
        onProgress?.(10 + Math.round((i / files.length) * 30), `Reading image ${i + 1}/${files.length}...`);
        const result = await Tesseract.recognize(files[i], 'eng');
        combined += '\n\n' + result.data.text;
    }
    return combined;
}

function naiveSummarize(rawText: string): AnalysisResult {
    const cleaned = rawText.replace(/\r\n/g, '\n').replace(/[^\S\n]+/g, ' ').trim();
    const sentences = cleaned.split(/(?<=[.!?])\s+|\n+/).map(s => s.trim()).filter(s => s.length > 20 && /[a-zA-Z]/.test(s));

    if (sentences.length === 0) {
        return { title: 'Overview', mainIdea: 'No text found.', blocks: [{ type: 'list', title: 'No Content', items: ['Could not extract text from images.'] }] };
    }

    let title = 'Chapter Overview';
    if (sentences[0].length < 60) title = sentences.shift()!.replace(/[.!?]+$/, '');

    const mainIdea = sentences.slice(0, 2).join(' ').slice(0, 180);
    const blocks: ContentBlock[] = [];
    let chunk: string[] = [];

    const flush = () => {
        if (chunk.length > 0) {
            blocks.push({ type: 'list', title: 'Key Points', items: chunk.slice(0, 4).map(s => s.slice(0, 100)) });
            chunk = [];
        }
    };

    for (const s of sentences) {
        if (blocks.length >= 6) break;
        if (s.includes('?') && s.length < 100) {
            flush();
            blocks.push({ type: 'question', title: s, items: [] });
        } else if (/^[A-Z][^.]*:?$/.test(s) && s.length < 50) {
            flush();
            blocks.push({ type: 'concept', title: s.replace(/[:.]+$/, ''), items: [] });
        } else if (blocks.length > 0 && blocks[blocks.length - 1].items.length < 4) {
            blocks[blocks.length - 1].items.push(s.replace(/^[\s•\-\d.)\]]+/, '').slice(0, 100));
        } else {
            chunk.push(s.replace(/^[\s•\-\d.)\]]+/, '').slice(0, 100));
            if (chunk.length >= 4) flush();
        }
    }
    flush();

    if (blocks.length === 0) {
        for (let i = 0; i < sentences.length && blocks.length < 4; i += 3) {
            blocks.push({ type: 'list', title: `Summary ${blocks.length + 1}`, items: sentences.slice(i, i + 3).map(s => s.slice(0, 100)) });
        }
    }

    return { title, mainIdea, blocks: blocks.slice(0, 6) };
}

// ─── Canvas Renderer ─────────────────────────────────────────────
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let line = words[0] || '';
    for (let i = 1; i < words.length; i++) {
        if (ctx.measureText(line + ' ' + words[i]).width < maxW) line += ' ' + words[i];
        else { lines.push(line); line = words[i]; }
    }
    if (line) lines.push(line);
    return lines;
}

function renderInfographic(data: AnalysisResult): Promise<Blob> {
    const W = 1200, PAD = 60, GAP = 30, COL_W = (W - PAD * 2 - GAP) / 2;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    const ctx = canvas.getContext('2d')!;

    // ── Pre-calculate heights ──
    let leftH = 0, rightH = 0;
    const layouts: { x: number; y: number; w: number; h: number; color: string; block: ContentBlock }[] = [];

    data.blocks.forEach((block, i) => {
        ctx.font = 'bold 20px Inter, sans-serif';
        const titleLines = wrapText(ctx, block.title, COL_W - 40);
        let h = titleLines.length * 28 + 30;

        ctx.font = '17px Inter, sans-serif';
        block.items.forEach(item => { h += wrapText(ctx, item, COL_W - 60).length * 24 + 12; });
        h += 30;

        const col = leftH <= rightH ? 0 : 1;
        const x = col === 0 ? PAD : PAD + COL_W + GAP;
        const y = col === 0 ? leftH : rightH;
        layouts.push({ x, y, w: COL_W, h, color: ACCENTS[i % ACCENTS.length], block });
        if (col === 0) leftH += h + 20; else rightH += h + 20;
    });

    // Header area
    ctx.font = 'bold 40px Inter, sans-serif';
    const titleLines = wrapText(ctx, data.title, W - 200);
    ctx.font = '18px Inter, sans-serif';
    const ideaLines = wrapText(ctx, data.mainIdea || '', W - 200);
    const headerH = 80 + titleLines.length * 50 + ideaLines.length * 28 + 60;

    const contentH = Math.max(leftH, rightH);
    const totalH = headerH + contentH + 80;
    canvas.height = totalH;

    // ── Background ──
    const bg = ctx.createLinearGradient(0, 0, 0, totalH);
    bg.addColorStop(0, '#0F172A');
    bg.addColorStop(1, '#1E1B4B');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, totalH);

    // Subtle grid dots
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    for (let x = 30; x < W; x += 30) for (let y = 30; y < totalH; y += 30) { ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill(); }

    // ── Header ──
    let curY = 60;
    ctx.textAlign = 'center';

    // AI badge
    ctx.fillStyle = 'rgba(123, 44, 191, 0.3)';
    ctx.beginPath(); ctx.roundRect(W / 2 - 80, curY - 25, 160, 32, 16); ctx.fill();
    ctx.fillStyle = '#C77DFF';
    ctx.font = '13px Inter, sans-serif';
    ctx.fillText('✨ AI-Generated Summary', W / 2, curY - 4);
    curY += 30;

    // Title
    ctx.fillStyle = '#F9FAFB';
    ctx.font = 'bold 40px Inter, sans-serif';
    titleLines.forEach(line => { ctx.fillText(line, W / 2, curY); curY += 50; });

    // Main idea
    ctx.fillStyle = '#D1D5DB';
    ctx.font = '18px Inter, sans-serif';
    ideaLines.forEach(line => { ctx.fillText(line, W / 2, curY); curY += 28; });

    // Separator
    curY += 20;
    const sepGrad = ctx.createLinearGradient(PAD * 2, 0, W - PAD * 2, 0);
    sepGrad.addColorStop(0, 'transparent');
    sepGrad.addColorStop(0.5, '#7B2CBF');
    sepGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = sepGrad;
    ctx.fillRect(PAD * 2, curY, W - PAD * 4, 3);
    curY += 40;

    // ── Blocks ──
    ctx.textAlign = 'left';
    layouts.forEach(({ x, y: relY, w, h, color, block }) => {
        const y = headerH + relY;

        // Card
        ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(x, y, w, h, 14); ctx.fill(); ctx.stroke();

        // Accent top bar
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.roundRect(x, y, w, 5, [14, 14, 0, 0]); ctx.fill();

        // Type badge
        const badge = block.type === 'question' ? '❓ Q&A' : block.type === 'concept' ? '💡 Concept' : '📋 Key Points';
        ctx.font = '12px Inter, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        const bw = ctx.measureText(badge).width + 16;
        ctx.beginPath(); ctx.roundRect(x + w - bw - 12, y + 14, bw, 22, 11); ctx.fill();
        ctx.fillStyle = color;
        ctx.fillText(badge, x + w - bw - 4, y + 30);

        // Title
        ctx.fillStyle = color;
        ctx.font = 'bold 20px Inter, sans-serif';
        let py = y + 36;
        wrapText(ctx, block.title, w - bw - 30).forEach(l => { ctx.fillText(l, x + 20, py); py += 26; });

        // Items
        py += 10;
        ctx.font = '17px Inter, sans-serif';
        block.items.forEach(item => {
            // Bullet
            ctx.fillStyle = color;
            ctx.beginPath(); ctx.arc(x + 24, py - 5, 3.5, 0, Math.PI * 2); ctx.fill();
            // Text
            ctx.fillStyle = '#E5E7EB';
            wrapText(ctx, item, w - 60).forEach(l => { ctx.fillText(l, x + 40, py); py += 24; });
            py += 8;
        });
    });

    // ── Footer ──
    ctx.textAlign = 'center';
    ctx.fillStyle = '#6B7280';
    ctx.font = '13px Inter, sans-serif';
    ctx.fillText('Generated with StudyEasily • Powered by AI', W / 2, totalH - 30);

    return new Promise(resolve => canvas.toBlob(b => resolve(b!)));
}

// ─── Main Export ─────────────────────────────────────────────────
export async function generateInfographic(
    files: File[],
    onProgress?: (p: number, msg: string) => void
): Promise<Blob> {
    let analysis: AnalysisResult;

    // Try Gemini Nano first
    const nanoReady = await isNanoAvailable();

    if (nanoReady) {
        onProgress?.(10, 'Using Gemini Nano AI...');

        // Still need OCR to get text from images
        const text = await extractTextFromImages(files, onProgress);
        onProgress?.(50, 'AI is analyzing content...');

        const nanoResult = await analyzeWithNano(text);
        if (nanoResult) {
            analysis = nanoResult;
            onProgress?.(80, 'AI analysis complete!');
        } else {
            onProgress?.(60, 'AI unavailable, using fallback...');
            analysis = naiveSummarize(text);
        }
    } else {
        // Fallback: OCR + naive summarizer
        onProgress?.(5, 'Extracting text from images...');
        const text = await extractTextFromImages(files, onProgress);
        onProgress?.(55, 'Summarizing content...');
        analysis = naiveSummarize(text);
    }

    onProgress?.(85, 'Rendering infographic...');
    const blob = await renderInfographic(analysis);
    onProgress?.(100, 'Done!');
    return blob;
}
