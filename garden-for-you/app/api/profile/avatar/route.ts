import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_TOKEN_COOKIE } from "@/shared/config/auth";
import { createSdk } from "@/shared/lib";

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET;

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_TOKEN_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ message: "Не авторизован" }, { status: 401 });
  }

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    return NextResponse.json(
      { message: "Cloudinary не настроен на сервере" },
      { status: 500 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ message: "Файл не найден" }, { status: 400 });
  }

  const cloudinaryForm = new FormData();
  cloudinaryForm.append("file", file);
  cloudinaryForm.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  cloudinaryForm.append("folder", "profiles");

  const cloudinaryResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: cloudinaryForm },
  );

  if (!cloudinaryResponse.ok) {
    return NextResponse.json(
      { message: "Ошибка загрузки изображения в Cloudinary" },
      { status: 500 },
    );
  }

  const cloudinaryData = await cloudinaryResponse.json();
  const avatarUrl = cloudinaryData.secure_url as string;

  try {
    const sdk = createSdk({ token });
    const { customer } = await sdk.store.customer.update({
      metadata: { avatar_url: avatarUrl },
    });
    return NextResponse.json({ customer, avatar_url: avatarUrl });
  } catch {
    return NextResponse.json(
      { message: "Ошибка сохранения аватара" },
      { status: 500 },
    );
  }
}
