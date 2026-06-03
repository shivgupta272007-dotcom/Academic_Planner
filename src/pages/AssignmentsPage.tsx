import Header from '../components/layout/Header';
import AssignmentList from '../components/assignments/AssignmentList';

export default function AssignmentsPage() {
  return (
    <div className="animate-fade-in">
      <Header title="Assignments" subtitle="Track and manage your academic work" />
      <AssignmentList />
    </div>
  );
}
