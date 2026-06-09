import Image from "next/image";
import { signIn } from "@/auth";
import kakaoBtn from "@/styles/kakao_login_medium_wide.png";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-surface-page flex flex-col items-center justify-center gap-4">
      <div className="mb-6 text-center">
        <h1 className="text-[28px] font-black tracking-widest text-brand">REFILL</h1>
        <p className="text-[13px] text-text-muted mt-1">음악을 채우다.</p>
      </div>

      <p className="text-[14px] font-semibold text-text-heading">소셜 계정으로 시작하기</p>

      {/* 카카오 */}
      <form
        action={async () => {
          "use server";
          await signIn("kakao", { redirectTo: "/" });
        }}
      >
        <button type="submit" className="cursor-pointer border-none bg-transparent p-0">
          <Image
            src={kakaoBtn}
            alt="카카오 로그인"
            height={45}
            priority
          />
        </button>
      </form>

      {/* 네이버 */}
      <form
        action={async () => {
          "use server";
          await signIn("naver", { redirectTo: "/" });
        }}
      >
        <button
          type="submit"
          className="cursor-pointer border-none p-0 flex items-center rounded-[12px] overflow-hidden"
          style={{ width: kakaoBtn.width, height: 45, background: "#03C75A" }}
        >
          {/* 네이버 N 로고 */}
          <span
            className="flex items-center justify-center shrink-0 font-black text-white"
            style={{ width: 45, height: 45, fontSize: 20, letterSpacing: "-1px" }}
          >
            N
          </span>
          <span
            className="flex-1 text-center text-white font-semibold"
            style={{ fontSize: 15 }}
          >
            네이버로 로그인
          </span>
          {/* 우측 여백 맞춤 */}
          <span style={{ width: 45 }} />
        </button>
      </form>
    </div>
  );
}
