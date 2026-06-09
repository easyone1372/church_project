"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import kakaoBtn from "@/styles/kakao_login_medium_wide.png";

interface LoginModalProps {
  onClose: () => void;
}

export default function LoginModal({ onClose }: LoginModalProps) {
  const btnWidth = kakaoBtn.width;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl flex flex-col items-center px-6 sm:px-10 py-9 gap-5 w-full"
        style={{
          maxWidth: btnWidth + 80,
          boxShadow: "0 24px 64px rgba(15,23,42,0.18)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="w-full flex justify-end">
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-body border-none bg-transparent cursor-pointer text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* 브랜딩 */}
        <div className="text-center -mt-2">
          <p className="text-[26px] font-black tracking-widest text-brand">REFILL</p>
          <p className="text-[12px] text-text-muted mt-0.5">음악을 채우다.</p>
        </div>

        <div className="text-center">
          <p className="text-[15px] font-bold text-text-heading">로그인 / 회원가입</p>
          <p className="text-[12px] text-text-muted mt-1">
            소셜 계정으로 간편하게 시작하세요
          </p>
        </div>

        {/* 카카오 */}
        <button
          onClick={() => signIn("kakao", { callbackUrl: window.location.pathname })}
          className="cursor-pointer border-none bg-transparent p-0 w-full"
          style={{ maxWidth: btnWidth }}
        >
          <Image
            src={kakaoBtn}
            alt="카카오 로그인"
            height={45}
            style={{ width: "100%", height: "auto" }}
            priority
          />
        </button>

        {/* 네이버 */}
        <button
          onClick={() => signIn("naver", { callbackUrl: window.location.pathname })}
          className="cursor-pointer border-none p-0 flex items-center rounded-xl overflow-hidden w-full"
          style={{ maxWidth: btnWidth, height: 45, background: "#03C75A" }}
        >
          <span
            className="flex items-center justify-center shrink-0 font-black text-white"
            style={{ width: 45, height: 45, fontSize: 20, letterSpacing: "-1px" }}
          >
            N
          </span>
          <span className="flex-1 text-center text-white font-semibold" style={{ fontSize: 15 }}>
            네이버로 로그인
          </span>
          <span style={{ width: 45 }} />
        </button>
      </div>
    </div>
  );
}
