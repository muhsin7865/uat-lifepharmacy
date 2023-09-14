import { ProductsPage } from "@/components/products-page";
import getProductsDataByCat from "@/lib/getProductsDataByCat";
import { stringify } from "querystring";

const Products = ({ productsData }: { productsData: any }) => {
  return (
    <ProductsPage
      isBrandsPage={false}
      isSearchPage={false}
      categoryData={productsData}
      type={"products"}
    />
  );
};

export default Products;

export async function getServerSideProps(context: any) {
  const { query } = context;

  const { locale } = context;

  const productsData = await getProductsDataByCat(stringify(query), 0, locale);
  return {
    props: {
      productsData: productsData.data,
    },
  };
}
