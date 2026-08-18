# lvpeiamr1

Build an "Ophthalmic Infection & AMR Surveillance Dashboard" for a tertiary care eye hospital with multiple campuses (main + satellite), using React, TypeScript, and Tailwind CSS.

DATA MODEL

A patient infection record with: id, hospitalId (campus name, e.g. "Main Campus (Hyderabad)", "Satellite Campus (Vijayawada)", "Satellite Campus (Bhubaneswar)", "Satellite Campus (Warangal)"), patientId, admissionDate, department (sub-specialty: Cornea, Retina & Vitreous, Glaucoma, Pediatric Ophthalmology, Oculoplasty, Uvea, Cataract & IOL, Ocular Oncology), procedure (Phacoemulsification, Vitrectomy, Trabeculectomy, Penetrating Keratoplasty, Squint Correction, DCR Surgery, Intravitreal Injection, Retinal Detachment Repair), wardType (OT-Main Campus, OT-Satellite Campus, Pre-Op Ward, Post-Op Ward, Day-Care, OPD), infectionType (Community Acquired Infection, Post-Surgical (HAI), Endophthalmitis, Not Known), clinicalDiagnosis, comorbidity, devicesUsed, gender, age, district, state, locationType.

Seed it with ~60 realistic sample records across Indian states (Telangana, Andhra Pradesh, Odisha, Tamil Nadu, Puducherry, West Bengal, Chandigarh), mixing urban/rural.

DASHBOARD LAYOUT (dark theme, slate/cyan/violet/pink accent colors, rounded card design)

1. Header: title "Ophthalmic Infection & AMR Surveillance Dashboard", subtitle about post-surgical infection and endophthalmitis monitoring across OTs and campuses. Include a Campus filter dropdown and a Ward/OT filter dropdown, both filtering everything below.

2. KPI row (5 cards): Total Infection Cases, Community Acquired (CAI), Post-Surgical Infections, Endophthalmitis Cases, Male/Female split.

3. Charts row 1: donut chart of Infection Type Distribution; horizontal bar chart of OT/Ward-wise Infection Analysis.

4. Charts row 2: horizontal bar chart of Sub-specialty Case Load; vertical bar chart of Infections by Surgical Procedure.

5. Case Records table: patient ID, gender/age, campus, sub-specialty, procedure, OT/ward, infection type, admission date — reactive to the filters above.

6. Footer note that this is sample/demonstration data.

Use recharts for all charts. Keep all data in-memory (no backend yet) so I can later connect Supabase for live data.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://lvpeiamr1.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ec868433-09cf-48d0-bdc0-baa2e65cf83f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
