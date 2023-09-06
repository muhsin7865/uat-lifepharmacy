import { useDispatch, useSelector } from "react-redux";
import createCartPOSTReq from "@/lib/createCart";
import { addWishListData, updateCartData } from "@/redux/cart.slice";
import { RootState } from "../redux/store";
import updateCartApiReq from "@/lib/updateCart";
import { useModal } from "@/components/ui/modalcontext";
import { toast } from "@/components/ui/toast";

export function useCartActions() {
  const dispatch = useDispatch();

  const cartItems = useSelector((state: RootState) => state.cart);

  const cartItemsData = cartItems.cart.cart_data
    ? cartItems.cart.cart_data.items
    : [];

  const cartId = cartItems.cart.cart_data
    ? cartItems.cart.cart_data.cart_id
    : null;

  const wishListData = cartItems.wishlist.data;

  const { setOrderSucessSheetState, setLoadingState } = useModal();

  const createCart = (payloadData: any) => {
    if (cartItemsData.length > 0) {
      updateCart(payloadData);
    } else {
      payloadData.data.items[0].qty > 0 ? setOrderSucessSheetState(true) : null;
      createCartPOSTReq(payloadData).then((res) => {
        if (!res.success) {
          debugger
          toast({
            title: "Error",
            message: `${res.message}`,
            type: "error",
          });
        } else {
          dispatch(updateCartData(res));
          setLoadingState("loadingDone");
          toast({
            title: "Success",
            message: "Updated Cart Details",
            type: "success",
          });
        }
      });
    }
  };

  const updateCart = (payloadData: any) => {
    payloadData.action = "update_items";
    payloadData.data.items[0].qty > 0 ? setOrderSucessSheetState(true) : null;
    updateCartApiReq(payloadData, cartId).then((res) => {
      if (!res.success) {
        debugger

        toast({
          title: "Error",
          message: `${res.message}`,
          type: "error",
        });
      } else {
        dispatch(updateCartData(res));
        setLoadingState("loadingDone");
        toast({
          title: "Success",
          message: "Updated Cart Details",
          type: "success",
        });
      }
    });
  };

  const addWishList = (payloadData: any) => {
    debugger;
    const updatedWishList = [...wishListData, ...payloadData];
    dispatch(addWishListData(updatedWishList));
    toast({
      title: "Success",
      message: "Item added to Wishlist",
      type: "success",
    });
  };

  const removeWishList = (proId: string) => {
    debugger;
    const updatedWishList = wishListData.filter(
      (proDetails: any) => proDetails.id !== proId
    );
    dispatch(addWishListData(updatedWishList));

    toast({
      title: "Success",
      message: "Item removed from Wishlist",
      type: "success",
    });
  };

  return {
    createCart,
    updateCart,
    addWishList,
    removeWishList,
  };
}
