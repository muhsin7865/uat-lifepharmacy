import { ProductsPage } from "@/components/products-page";
import getProductsDataByCat from "@/lib/getProductsDataByCat";

const ChildCategory = ({ categoryData }: { categoryData: any }) => {
  return (
    <ProductsPage
      isSearchPage={false}
      categoryData={categoryData}
      type={"category"}
      isBrandsPage={false}
    />
  );
};

export default ChildCategory;

export async function getStaticProps({
  locale,
  params,
}: {
  locale: any;
  params: any;
}) {
  const childCategory = params.childCategory;
  let filterPath = `categories=${childCategory}`;

  const categoryData = await getProductsDataByCat(filterPath, 0, locale);

  return {
    props: {
      categoryData: categoryData.data,
    },
  };
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}
