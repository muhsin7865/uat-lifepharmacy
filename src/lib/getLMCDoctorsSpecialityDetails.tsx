export default async function getLMCDoctorsSpecialityDetails(locale: string) {
  var requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Latitude: "25.21937",
      Longitude: "55.272887",
    },
  };
  const res = await fetch(
    `https://prodapp.lifepharmacy.com/api/clinics/v1/specialties?new_method=true&lang=${locale}`,
    requestOptions
  );

  if (!res.ok) return new Error("Failed to fetch data");

  return res.json();
}
