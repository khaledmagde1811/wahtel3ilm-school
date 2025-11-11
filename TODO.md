# MonthlyExams.js Refactoring Plan

## 1. Fix 'score' to 'total_score' in exam_attempts
- [ ] Replace all 'score' references with 'total_score' in INSERT/UPDATE/SELECT operations
- [ ] Remove 'percentage' from INSERT/UPDATE since it's computed in DB

## 2. Fix question insertion bugs
- [ ] Update `prepareQuestionForDatabase` to only use existing columns
- [ ] Remove difficulty_level, topic, etc. from question insertion

## 3. Refactor student exam form
- [ ] Ensure the taking exam panel is fully scrollable
- [ ] Support all question types with proper rendering
- [ ] Store answers in takingAnswers keyed by question_id

## 4. Change submission logic
- [ ] Modify `submitExamManually` to save answers as JSON in exam_attempts.answers
- [ ] Compute total_marks and total_score from questions and answers
- [ ] Update exam_attempts with total_score, total_marks, status='submitted', submitted_at
- [ ] Remove inserts into exam_answers table

## 5. Add "View Detailed Report" feature
- [ ] Add button in results modal for each attempt
- [ ] Create new modal showing performance breakdown by question type, incorrect questions, and recommendations

## 6. Optimize and clean up code
- [ ] Remove unused logic like old grading details, error analytics
- [ ] Ensure code is organized
