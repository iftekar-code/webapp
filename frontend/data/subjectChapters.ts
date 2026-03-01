// Class 10 Subjects & Chapters — shared between Home page and Admin NoteEditor

export interface Subject {
    name: string;
    emoji: string;
    color: string;
    /** Category value used in the notes table (must match NoteEditor categories) */
    category: string;
    chapters: string[];
}

export const CLASS_10_SUBJECTS: Subject[] = [
    {
        name: 'Mathematics',
        emoji: '🔢',
        color: '#6366f1',
        category: 'Math',
        chapters: [
            'Real Numbers', 'Polynomials', 'Pair of Linear Equations in Two Variables',
            'Quadratic Equations', 'Arithmetic Progressions', 'Triangles',
            'Coordinate Geometry', 'Introduction to Trigonometry',
            'Some Applications of Trigonometry', 'Circles', 'Areas Related to Circles',
            'Surface Areas and Volumes', 'Statistics', 'Probability',
        ],
    },
    {
        name: 'Science',
        emoji: '🔬',
        color: '#10b981',
        category: 'Science',
        chapters: [
            'Chemical Reactions and Equations', 'Acids, Bases and Salts',
            'Metals and Non-Metals', 'Carbon and its Compounds',
            'Life Processes', 'Control and Coordination',
            'How do Organisms Reproduce?', 'Heredity',
            'Light – Reflection and Refraction', 'The Human Eye and the Colourful World',
            'Electricity', 'Magnetic Effects of Electric Current',
            'Our Environment',
        ],
    },
    {
        name: 'English',
        emoji: '📖',
        color: '#f59e0b',
        category: 'English',
        chapters: [
            'A Letter to God', 'Nelson Mandela: Long Walk to Freedom',
            'Two Stories about Flying', 'From the Diary of Anne Frank',
            'The Hundred Dresses – I', 'The Hundred Dresses – II',
            'A Triumph of Surgery', 'The Thief\'s Story',
            'Footprints without Feet', 'The Making of a Scientist',
            'The Necklace', 'The Hack Driver',
        ],
    },
    {
        name: 'Social Science',
        emoji: '🌍',
        color: '#ef4444',
        category: 'social science',
        chapters: [
            'The Rise of Nationalism in Europe', 'Nationalism in India',
            'The Making of a Global World', 'The Age of Industrialisation',
            'Print Culture and the Modern World',
            'Resources and Development', 'Forest and Wildlife Resources',
            'Water Resources', 'Agriculture', 'Minerals and Energy Resources',
            'Manufacturing Industries', 'Life Lines of National Economy',
            'Power Sharing', 'Federalism', 'Gender, Religion and Caste',
            'Political Parties', 'Outcomes of Democracy',
            'Development', 'Sectors of the Indian Economy',
            'Money and Credit', 'Globalisation and the Indian Economy',
        ],
    },
    {
        name: 'Hindi',
        emoji: '📝',
        color: '#8b5cf6',
        category: 'hindi',
        chapters: [
            'सूरदास के पद', 'राम-लक्ष्मण-परशुराम संवाद',
            'आत्मकथ्य', 'उत्साह और अट नहीं रही',
            'यह दंतुरहित मुस्कान और फसल',
            'छाया मत छूना', 'कन्यादान', 'संगतकार',
            'नेताजी का चश्मा', 'बालगोबिन भगत',
            'लखनवी अंदाज़', 'मानवीय करुणा की दिव्य चमक',
        ],
    },
    {
        name: 'English (IL)',
        emoji: '✍️',
        color: '#0ea5e9',
        category: 'english (iL)',
        chapters: [
            'Grammar – Tenses', 'Grammar – Modals', 'Grammar – Subject-Verb Agreement',
            'Grammar – Reported Speech', 'Grammar – Active and Passive Voice',
            'Writing – Letter Writing', 'Writing – Article Writing',
            'Writing – Story Writing', 'Writing – Paragraph Writing',
            'Literature – Prose', 'Literature – Poetry', 'Literature – Drama',
        ],
    },
    {
        name: 'Geography (Adv)',
        emoji: '🗺️',
        color: '#14b8a6',
        category: 'advGeography',
        chapters: [
            'Resources and Development', 'Forest and Wildlife Resources',
            'Water Resources', 'Agriculture', 'Minerals and Energy Resources',
            'Manufacturing Industries', 'Lifelines of National Economy',
            'Map Work and Practicals',
        ],
    },
];

/** Quick lookup: category string → Subject */
export const CATEGORY_TO_SUBJECT = new Map(
    CLASS_10_SUBJECTS.map(s => [s.category, s])
);
