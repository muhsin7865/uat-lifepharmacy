import { ProductsPage } from "@/components/products-page";
import getCategoryData from "@/lib/getCategoryData";
import getProductsDataByCat from "@/lib/getProductsDataByCat";

const MainCategory = ({ categoryData }: { categoryData: any }) => {
  return (
    <ProductsPage
      isBrandsPage={false}
      isSearchPage={false}
      categoryData={categoryData}
      type={"category"}
    />
  );
};

export default MainCategory;

export async function getStaticProps({
  locale,
  params,
}: {
  locale: any;
  params: any;
}) {
  const mainCategory = params.category;

  let filterPath = `categories=${mainCategory}`;

  const categoryData = await getProductsDataByCat(filterPath, 0, locale);

  return {
    props: {
      categoryData: categoryData.data,
      filterPath,
      params,
      selectedBrands: "",
    },
  };
}

export async function getStaticPaths() {
  function slugify(text: string) {
    return text.toLowerCase().replace(/[\/\s&]+/g, "-");
  }

  const categoryData = await getCategoryData();
  const paths = categoryData.data.map((main_cat: any) => ({
    params: {
      category: slugify(main_cat.name),
    },
  }));

  return {
    paths,
    fallback: "blocking",
  };
}
