import { getInstitute, getAdminKey, getStudentUniqueId } from '../../utils/storage';

export async function getStudents(uniqueId) {
    const [institute, adminKey] = await Promise.all([getInstitute(), getAdminKey()]);
    return await fetch(`http://localhost:8000/admin_students/students/?institute=${institute}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            "X-Admin-Key": adminKey ? adminKey : uniqueId
        },
    }).then(res => res.json().then(data => ({ status: res.status, body: data })));
}

export async function addStudent(student) {
    const [institute, adminKey] = await Promise.all([getInstitute(), getAdminKey()]);
    return await fetch(`http://localhost:8000/admin_students/students/?institute=${institute}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "X-Admin-Key": adminKey
        },
        body: JSON.stringify(student),
    }).then(res => res.json().then(data => ({
        status: res.status,
        body: data
    })));
}

export async function updateAmount(id, payment, pending) {
    console.log("payment", id, payment);
    const myPayment = {
        fee_details: {
            paid_amount: payment,
            pending_amount: pending
        }
    };
    const [institute, adminKey] = await Promise.all([getInstitute(), getAdminKey()]);
    const res = await fetch(`http://localhost:8000/admin_students/students/${id}/?institute=${institute}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            "X-Admin-Key": adminKey
        },
        body: JSON.stringify(myPayment),
    });
    return await res.json().then(data => ({ status: res.status, body: data }));
}

export async function getStudentId(email, uniqueId, instituteId) {
    console.log("email", email);
    console.log("uniqueId", uniqueId);
    const data = {
        email: email,
        personal_id: uniqueId
    };
    // Use the passed-in instituteId first; fall back to encrypted storage
    const institute = instituteId ?? await getInstitute();
    return await fetch(`http://localhost:8000/admin_students/verify/?institute=${institute}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(res => res.json().then(data => ({ status: res.status, body: data })));
}

export async function getStudent(id) {
    const studentUniqueId = await getStudentUniqueId();
    return await fetch(`http://localhost:8000/admin_students/students/${id}/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json',
            "X-Personal-Key": studentUniqueId
         },
    }).then(res => res.json().then(data => ({ status: res.status, body: data })));
}

export async function updateStudent(id, student) {
    const [institute, adminKey] = await Promise.all([getInstitute(), getAdminKey()]);
    return await fetch(`http://localhost:8000/admin_students/students/${id}/?institute=${institute}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            "X-Admin-Key": adminKey
        },
        body: JSON.stringify(student),
    }).then(res => res.json().then(data => ({ status: res.status, body: data })));
}