import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

// ===========================================
//             TYPESCRIPT INTERFACES
// ===========================================

// 1. PassagePart Interface
export interface PassagePart {
    id: string;
    text: string;
}

// 2. Question Interface
export interface Question {
    id: number;
    type: 'gap_fill' | 'multiple_choice' | 'tfng';
    answer?: string;
    
    // Gap-fill specific
    pre?: string;
    post?: string;
    words?: number;
    
    // Multiple Choice specific
    question?: string; 
    options?: string[];
    
    // TFNG specific
    statement?: string; 
}

// 3. QuestionGroup Interface
export interface QuestionGroup {
    group_title: string;
    type?: 'gap_fill' | 'multiple_choice' | 'tfng'; 
    instruction?: string; 
    questions: Question[];
}

// 4. TestPart Interface
export interface TestPart {
    part_id: number;
    passage_title: string;
    passage: PassagePart[];
    question_groups: QuestionGroup[];
}


// 5. Main Test Interface (Mongoose Document)
export interface ITest extends MongooseDocument {
    test_id: string;
    test_title: string;
    level: string;
    total_questions: number;
    full_passage_text: string;
    parts: TestPart[]; 
    createdAt: Date;
}


// ===========================================
//                  MONGOOSE SCHEMAS
// ===========================================

// Question schema - barcha savol turlari uchun moslashgan
const QuestionSchema = new Schema<Question>({
    id: { type: Number, required: true },
    // Gap-fill uchun
    pre: { 
        type: String, 
        required: true, 
        default: ' ' 
    },
    post: { 
        type: String, 
        required: true,
        default: ' ' 
    },
    words: { 
        type: Number, 
        required: true,
        default: 1 
    },
    // Multiple choice uchun
    question: { type: String, default: '' },
    options: { type: [String], default: [] },
    // TFNG uchun
    statement: { type: String, default: '' },
    // Umumiy
    type: { 
        type: String, 
        enum: ['gap_fill', 'multiple_choice', 'tfng'],
        default: 'gap_fill' 
    },
    answer: { type: String, default: '' }
}, {
    validateBeforeSave: false,
    _id: false 
});

// Question Group schema
const QuestionGroupSchema = new Schema<QuestionGroup>({
    group_title: { type: String, required: true },
    instruction: { type: String, default: '' }, 
    questions: [QuestionSchema]
}, { _id: false });

// Passage Part schema
const PassagePartSchema = new Schema<PassagePart>({
    id: { type: String, required: true },
    text: { type: String, required: true }
}, { _id: false });

// Part schema
const PartSchema = new Schema<TestPart>({
    part_id: { type: Number, required: true },
    passage_title: { type: String, required: true },
    passage: [PassagePartSchema],
    question_groups: [QuestionGroupSchema]
}, { _id: false });

// Main Test schema
const TestSchema = new Schema<ITest>({
    test_id: { type: String, required: true, unique: true },
    test_title: { type: String, required: true },
    level: { type: String, default: 'User Upload' },
    total_questions: { type: Number, required: true },
    full_passage_text: { type: String, required: true },
    parts: [PartSchema],
    createdAt: { type: Date, default: Date.now }
});


// ===========================================
//                  EXPORT
// ===========================================

const TestModel = mongoose.models.Test || mongoose.model<ITest>('Test', TestSchema);

export default TestModel;