import type { Dispatch } from "@reduxjs/toolkit";
import {
  syncCartRequest,
  updateCart,
  updateCartItemQuantityReducer,
  updateCartItemQuantityRequest,
} from "@/entities/cart";

export async function updateCartItemQuantity(
  dispatch: Dispatch,
  lineItemId: string,
  quantity: number,
) {
  if (!Number.isInteger(quantity) || quantity < 1) {
    console.warn(
      `[updateCartItemQuantity] Invalid quantity: ${quantity}. Must be a positive integer.`,
    );
    return null;
  }

  try {
    dispatch(
      updateCartItemQuantityReducer({
        id: lineItemId,
        newQuantity: quantity,
      }),
    );

    const updatedCart = await updateCartItemQuantityRequest(
      lineItemId,
      quantity,
    );

    const updatedItem = updatedCart.items?.find(
      (item) => item.id === lineItemId,
    );

    if (updatedItem && updatedItem.quantity !== quantity) {
      dispatch(
        updateCartItemQuantityReducer({
          id: updatedItem.id,
          newQuantity: updatedItem.quantity,
        }),
      );
    }

    return updatedCart;
  } catch (error) {
    console.error(
      `[updateCartItemQuantity] Failed to update item ${lineItemId}:`,
      error,
    );

    try {
      const currentCart = await syncCartRequest();
      dispatch(updateCart(currentCart));
    } catch (syncError) {
      console.error(
        `[updateCartItemQuantity] Failed to sync cart after error:`,
        syncError,
      );
    }

    return null;
  }
}
