// Seed driver + applicant data for the In-House Fleet Manager — one hired driver ready to test
// the PIN dispatch terminal immediately, plus two applicants sitting in the hiring pipeline.
import { uid } from "../utils/helpers";

export function buildSeedDrivers() {
  return [
    {
      id: uid("driver"),
      name: "Sarah T.",
      phone: "(555) 402-8890",
      vehicleType: "Honda Civic",
      pin: "1234",
      authToken: uid("token"),
      status: "OFF_CLOCK", // OFF_CLOCK | IN_STORE | ON_ROAD
      clockInAt: null,
      inStoreSince: null,
      hiredAt: Date.now() - 40 * 86400000,
    },
  ];
}

export function buildSeedApplicants() {
  return [
    {
      id: uid("applicant"),
      name: "Diego Martinez",
      phone: "(555) 774-2201",
      vehicleType: "Toyota Corolla",
      hasLicenseInsurance: true,
      stage: "new", // new | contacted | hired
      appliedAt: Date.now() - 2 * 86400000,
    },
    {
      id: uid("applicant"),
      name: "Priya Shah",
      phone: "(555) 118-4432",
      vehicleType: "Scooter",
      hasLicenseInsurance: true,
      stage: "contacted",
      appliedAt: Date.now() - 5 * 86400000,
    },
  ];
}

/** A 4-digit PIN not already in use by another driver. */
export function generateUniquePin(existingDrivers) {
  const used = new Set(existingDrivers.map((d) => d.pin));
  let pin;
  do {
    pin = String(Math.floor(1000 + Math.random() * 9000));
  } while (used.has(pin));
  return pin;
}
