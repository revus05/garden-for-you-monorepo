import type { Dispatch } from "@reduxjs/toolkit";
import {
  syncCartRequest,
  updateCart,
  updateCartItemQuantityRequest,
} from "@/entities/cart";

const inFlightItems = new Set<string>();

export async function updateCartItemQuantity(
  dispatch: Dispatch,
  lineItemId: string,
  quantity: number,
): Promise<void> {
  if (!Number.isInteger(quantity) || quantity < 1) return;
  if (inFlightItems.has(lineItemId)) return;

  inFlightItems.add(lineItemId);
  try {
    const updatedCart = await updateCartItemQuantityRequest(lineItemId, quantity);
    dispatch(updateCart(updatedCart));
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
  } finally {
    inFlightItems.delete(lineItemId);
  }
}
