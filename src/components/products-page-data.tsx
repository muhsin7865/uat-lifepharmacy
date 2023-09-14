import { SingleProductData } from "./single-product-data";
import React, { useState } from "react";
import { useRouter } from "next/router";
import getProductsDataByCat from "@/lib/getProductsDataByCat";
import { useLanguage } from "@/hooks/useLanguage";
import { ProductsSkeleton } from "./productsSkeleton";
import getBrandProductData from "@/lib/getBrandProductData";
import Link from "next/link";
import { useEffect } from "react";
import { Typography } from "./ui/typography";
import { ProductFilters } from "./product-filters";
import { useModal } from "./ui/modalcontext";
import InfiniteScroll from "react-infinite-scroll-component";
import { Icon } from "./ui/icons";
import { stringify } from "querystring";
import dynamic from "next/dynamic";

const FiltersSection = dynamic(
  () => import("./category-filters").then((mod) => mod.FiltersSection),
  {
    ssr: false,
  }
);

const ProductsPageData = ({
  categoryData,
  brandsData,
  isSearchPage,
  isBrandsPage,
}: {
  isSearchPage: boolean;
  categoryData: any;
  brandsData: any;
  isBrandsPage: boolean;
}) => {
  const router = useRouter();
  const { query } = router;

  const [noOfProducts, setNoOfProducts] = useState(40);
  const [data, setData] = useState<any>([]);
  const [productFilterApplied, setProductsFilterApplied] = useState(false);
  const [isClientSideData, setIsClientSideData] = useState(false);
  const noOfProductsCurrently = categoryData.products.length + data.length;
  const [showMoreProductsbtn, setShowMoreProductsbtn] = useState(
    noOfProductsCurrently < categoryData.total_count
  );

  const { locale } = useLanguage();

  useEffect(() => {
    const handleRouteChange = () => {
      setIsClientSideData(true);

      setProductsFilterApplied(true);
      fetchData(0, false, stringify(router.query));
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router]);

  const { selectedUserPrefernece } =
    useModal();

  function fetchData(
    noOfProducts: number,
    loadMoreData: boolean,
    filterPaths: string
  ) {
    if (!isBrandsPage) {
      debugger;
      getProductsDataByCat(filterPaths, noOfProducts, locale).then(
        (proData: any) => {
          if (loadMoreData) {
            setData((prevContent: any) => [
              ...prevContent,
              ...proData.data.products,
            ]);
          } else {
            setData(proData.data.products);
            setProductsFilterApplied(false);
          }
        }
      );
    } else {
      getBrandProductData(
        query.brand,
        query.singleCategory ? query.singleCategory : "",
        filterPaths,
        noOfProducts,
        locale
      ).then((brandsProductsData: any) => {
        if (loadMoreData) {
          setData((prevContent: any) => [
            ...prevContent,
            ...brandsProductsData.data.products,
          ]);
        } else {
          setData(brandsProductsData.data.products);
          setProductsFilterApplied(false);
        }
      });
    }
    if (loadMoreData) {
      if (productsLength === noOfProductsCurrently) {
        setShowMoreProductsbtn(false);
      } else {
        setShowMoreProductsbtn(true);
      }
    }
  }

  function loadMoreProducts() {
    fetchData(noOfProducts, true, stringify(router.query));
    setNoOfProducts((c) => c + 40);
  }

  const productsLength =
    data.length === 0
      ? categoryData.total_count
        ? categoryData.total_count
        : noOfProducts
      : categoryData.total_count;

  return (
    <div className=" max-w-[1450px] mx-auto  sm:px-[10px] px-[5px]">
      <ProductFilters
        noOfProductsCurrently={noOfProductsCurrently}
        productsLength={productsLength}
      />

      <div className="pb-24">
        <div className="grid grid-cols-1 gap-x-8  lg:grid-cols-4">
          {!isSearchPage && !isBrandsPage ? (
            <div>
              <FiltersSection brandsData={brandsData} />
            </div>
          ) : !isSearchPage ? (
            <div className="hidden lg:block space-y-2">
              <Typography bold={"bold"}>Category</Typography>
              {categoryData.categories.map((cat_data: any, indx: number) => (
                <div className="flex justify-between text-gray-800 text-sm">
                  <Link
                    href={`/brand/${query.brand}/${cat_data.slug}`}
                    className={`${
                      query.singleCategory
                        ? query.singleCategory === cat_data.slug
                          ? "text-blue-500"
                          : ""
                        : indx === 0
                        ? "text-blue-500"
                        : ""
                    } hover:text-blue-500`}
                  >
                    {cat_data.name}
                  </Link>
                  <div>{cat_data.count}</div>
                </div>
              ))}
            </div>
          ) : null}
          <div
            className={`${isSearchPage ? " col-span-full py-7" : "col-span-3"}`}
          >
            <InfiniteScroll
              scrollThreshold={0.9}
              dataLength={data.length ? data.length : 0}
              next={loadMoreProducts}
              hasMore={showMoreProductsbtn}
              loader={
                <div className="flex space-x-2 rtl:space-x-reverse justify-center items-center py-5">
                  <Icon
                    type="loadingIcon"
                    animation={"spin"}
                    sizes={"lg"}
                    className="text-primary"
                  />
                </div>
              }
            >
              <div
                className={`grid ${
                  selectedUserPrefernece &&
                  selectedUserPrefernece.value === "row"
                    ? "!grid-cols-1 !gap-0"
                    : ""
                } ${
                  isSearchPage
                    ? "xl:grid-cols-6 md:grid-cols-4 sm:grid-cols-3 "
                    : "  md:grid-cols-4 sm:grid-cols-3 xs:grid-cols-2 grid-cols-1"
                }  xs:grid-cols-2 grid-cols-1 sm:gap-3 gap-1`}
              >
                {!isClientSideData ? (
                  categoryData.products.length > 0 ? (
                    categoryData.products.map((pro_data: any) =>
                      productFilterApplied ? (
                        <ProductsSkeleton />
                      ) : (
                        <SingleProductData
                          pro_data={pro_data}
                          isRowView={
                            selectedUserPrefernece
                              ? selectedUserPrefernece.value === "row"
                              : false
                          }
                        />
                      )
                    )
                  ) : (
                    <div className="w-full col-span-3">
                      <Typography
                        variant={"paragraph"}
                        className="py-2"
                        alignment={"horizontalCenter"}
                      >
                        No Products Found
                      </Typography>
                    </div>
                  )
                ) : null}

                {data.length > 0
                  ? data.map((pro_data: any) =>
                      productFilterApplied ? (
                        <ProductsSkeleton />
                      ) : (
                        <SingleProductData
                          pro_data={pro_data}
                          isRowView={
                            selectedUserPrefernece
                              ? selectedUserPrefernece.value === "row"
                              : false
                          }
                        />
                      )
                    )
                  : isClientSideData && (
                      <div className="w-full col-span-3">
                        <Typography
                          variant={"paragraph"}
                          className="py-2"
                          alignment={"horizontalCenter"}
                        >
                          No Products Found
                        </Typography>
                      </div>
                    )}
              </div>
            </InfiniteScroll>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPageData;
