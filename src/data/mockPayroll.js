// Seed shift + driver data so the Payroll Export has something real to convert to CSV on day one.
import { uid } from "../utils/helpers";

const DAY = 86400000;

export function buildSeedPayroll() {
  const today = new Date();
  const isoDaysAgo = (n) => new Date(today.getTime() - n * DAY).toISOString().slice(0, 10);

  const shiftReports = [
    { id: uid("shift"), employeeName: "Alex Rivera", date: isoDaysAgo(1), hoursWorked: 7.5, cashTips: 42.0 },
    { id: uid("shift"), employeeName: "Jordan Lee", date: isoDaysAgo(1), hoursWorked: 6.0, cashTips: 18.5 },
    { id: uid("shift"), employeeName: "Sam Patel", date: isoDaysAgo(2), hoursWorked: 8.0, cashTips: 51.25 },
    { id: uid("shift"), employeeName: "Alex Rivera", date: isoDaysAgo(3), hoursWorked: 5.5, cashTips: 29.0 },
    { id: uid("shift"), employeeName: "Casey Nguyen", date: isoDaysAgo(3), hoursWorked: 7.0, cashTips: 33.75 },
    { id: uid("shift"), employeeName: "Jordan Lee", date: isoDaysAgo(5), hoursWorked: 6.5, cashTips: 22.0 },
  ];

  const driverCashouts = [
    { id: uid("cashout"), employeeName: "Jordan Lee", date: isoDaysAgo(1), mileage: 38, mileageOwed: 24.7 },
    { id: uid("cashout"), employeeName: "Jordan Lee", date: isoDaysAgo(5), mileage: 21, mileageOwed: 13.65 },
    { id: uid("cashout"), employeeName: "Casey Nguyen", date: isoDaysAgo(3), mileage: 29, mileageOwed: 18.85 },
  ];

  return { shiftReports, driverCashouts };
}
