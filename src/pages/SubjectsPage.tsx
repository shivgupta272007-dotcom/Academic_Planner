import Header from '../components/layout/Header';
import SubjectList from '../components/subjects/SubjectList';

export default function SubjectsPage() {
  return (
    <div className="animate-fade-in">
      <Header title="Subjects" subtitle="Organize your courses and track progress" />
      <SubjectList />
    </div>
  );
}
