import { getInstitute, getAdminKey } from '../../utils/storage';

export async function addPayments(professorId, monthYear, paymentDate, paymentAmount, paymentStatus) {
    const [instituteId, adminKey] = await Promise.all([getInstitute(), getAdminKey()]);
    return await fetch(`http://localhost:8000/admin_payments/upsert/?institute=${instituteId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Admin-Key': adminKey
        },
        body: JSON.stringify({
            institute: parseInt(instituteId),
            professor: professorId,
            month_year: monthYear,
            payment_date: paymentDate,
            payment_amount: paymentAmount,
            payment_status: paymentStatus
        })
    }).then(res => res.json().then(data => ({ status: res.status, body: data })));
}

export async function getPayments() {
    const [institute, adminKey] = await Promise.all([getInstitute(), getAdminKey()]);
    return await fetch(`http://localhost:8000/admin_payments/professors-payments/?institute=${institute}`, {
        headers: {
            'Content-Type': 'application/json',
            'X-Admin-Key': adminKey
        }
    })
    .then(res => res.json().then(data => ({ status: res.status, body: data })));
}
