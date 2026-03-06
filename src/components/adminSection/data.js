// Sample data for admin panels
export const studentsData = [
  { id: 1, rollNo: 'CS001', name: 'John Doe', email: 'john@edu.com', course: 'Computer Science', status: 'Active', fee: 5000, paid: 3000 },
  { id: 2, rollNo: 'CS002', name: 'Alice Brown', email: 'alice@edu.com', course: 'Computer Science', status: 'Active', fee: 5000, paid: 5000 },
  { id: 3, rollNo: 'CS003', name: 'Bob Wilson', email: 'bob@edu.com', course: 'Computer Science', status: 'Active', fee: 5000, paid: 4000 },
  { id: 4, rollNo: 'MTH001', name: 'Jane Smith', email: 'jane@edu.com', course: 'Mathematics', status: 'Active', fee: 4500, paid: 4500 },
  { id: 5, rollNo: 'MTH002', name: 'Charlie Davis', email: 'charlie@edu.com', course: 'Mathematics', status: 'Active', fee: 4500, paid: 3000 },
  { id: 6, rollNo: 'MTH003', name: 'Diana Lee', email: 'diana@edu.com', course: 'Mathematics', status: 'Inactive', fee: 4500, paid: 2000 },
  { id: 7, rollNo: 'PHY001', name: 'Mike Johnson', email: 'mike@edu.com', course: 'Physics', status: 'Inactive', fee: 4000, paid: 2000 },
  { id: 8, rollNo: 'PHY002', name: 'Emma Taylor', email: 'emma@edu.com', course: 'Physics', status: 'Active', fee: 4000, paid: 4000 },
  { id: 9, rollNo: 'PHY003', name: 'Frank Miller', email: 'frank@edu.com', course: 'Physics', status: 'Active', fee: 4000, paid: 3500 },
];

export const professorsData = [
  { id: 1, name: 'Dr. Sarah Wilson', email: 'sarah@edu.com', phone: '9876543210', department: 'Computer Science', qualification: 'Ph.D. in AI', specialization: 'Machine Learning', dob: '1985-03-15', gender: 'female', address: '12 Tech Park, Bangalore', salary: 8000, paidMonths: ['Jan'] },
  { id: 2, name: 'Prof. James Brown', email: 'james@edu.com', phone: '9876543211', department: 'Mathematics', qualification: 'Ph.D. in Pure Math', specialization: 'Abstract Algebra', dob: '1978-07-22', gender: 'male', address: '45 University Rd, Delhi', salary: 7500, paidMonths: ['Jan', 'Feb'] },
  { id: 3, name: 'Dr. Emily Davis', email: 'emily@edu.com', phone: '9876543212', department: 'Physics', qualification: 'Ph.D. in Quantum Physics', specialization: 'Quantum Mechanics', dob: '1982-11-10', gender: 'female', address: '78 Science Ave, Mumbai', salary: 7000, paidMonths: ['Jan'] },
  { id: 4, name: 'Dr. Raj Patel', email: 'raj@edu.com', phone: '9876543213', department: 'Computer Science', qualification: 'Ph.D. in Data Science', specialization: 'Big Data Analytics', dob: '1990-01-25', gender: 'male', address: '33 IT Hub, Pune', salary: 7800, paidMonths: [] },
  { id: 5, name: 'Prof. Lisa Chen', email: 'lisa@edu.com', phone: '9876543214', department: 'Mathematics', qualification: 'Ph.D. in Statistics', specialization: 'Probability Theory', dob: '1988-09-05', gender: 'female', address: '21 College Lane, Chennai', salary: 7200, paidMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May'] },
  { id: 6, name: 'Dr. Ahmed Khan', email: 'ahmed@edu.com', phone: '9876543215', department: 'Physics', qualification: 'Ph.D. in Astrophysics', specialization: 'Cosmology', dob: '1980-06-18', gender: 'male', address: '56 Observatory Rd, Hyderabad', salary: 7500, paidMonths: [] },
];

// Generate deterministic mock attendance history for each student
const generateAttendanceHistory = () => {
  const history = {};
  const year = 2026;
  const months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; // Jan-Dec

  studentsData.forEach((student) => {
    history[student.id] = [];
    // Use student id as a seed for deterministic "random" data
    let seed = student.id * 7 + 3;
    months.forEach((month) => {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const dateObj = new Date(year, month, day);
        const dayOfWeek = dateObj.getDay();
        // Skip only Sundays (0=Sunday); Saturday is a working day
        if (dayOfWeek === 0) continue;
        // Deterministic attendance based on seed
        seed = (seed * 31 + 17) % 100;
        const present = seed > 15; // ~85% attendance rate, varies per student
        history[student.id].push({
          date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
          month: month,
          year: year,
          dayOfWeek,
          present,
          studentId: student.id,
          studentName: student.name,
          rollNo: student.rollNo,
          course: student.course,
        });
      }
    });
  });
  return history;
};

export const attendanceHistory = generateAttendanceHistory();

// Helper: get unique courses
export const courses = [...new Set(studentsData.map((s) => s.course))];

// Helper: month names
export const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
