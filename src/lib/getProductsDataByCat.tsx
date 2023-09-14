export default async function getProductsDataByCat(
  filterPath: string,
  noOfProducts: number,
  lang: any
) {


  const urlPath = `https://prodapp.lifepharmacy.com/api/web/products?${`${filterPath}&`}type=cols&skip=${noOfProducts}&take=40&channel=web&new_method=true&lang=${lang}`;

  const res = await fetch(urlPath);

  if (!res.ok) throw new Error("failed to fetch data");

  return res.json();
}
