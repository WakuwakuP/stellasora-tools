import {type Meta, type StoryObj} from "@storybook/react";
import {useState} from "react";
import {InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot} from "./input-otp";
import {Button} from "./button";
import {Label} from "./label";

const meta: Meta<typeof InputOTP> = {
  title: "UI/Input OTP",
  component: InputOTP,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof InputOTP>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState("");

    return (
      <div className="space-y-4">
        <div>
          <Label>認証コードを入力してください</Label>
        </div>
        <InputOTP maxLength={6} value={value} onChange={setValue}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        {value && (
          <div className="text-sm text-slate-600 dark:text-slate-400">
            入力されたコード: {value}
          </div>
        )}
      </div>
    );
  },
};

export const WithSeparator: Story = {
  render: () => {
    const [value, setValue] = useState("");

    return (
      <div className="space-y-4">
        <div>
          <Label>6桁のコードを入力</Label>
        </div>
        <InputOTP maxLength={6} value={value} onChange={setValue}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>
    );
  },
};

export const PhoneVerification: Story = {
  render: () => {
    const [value, setValue] = useState("");

    return (
      <div className="space-y-4 max-w-md">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">電話番号を確認</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            +81 90-xxxx-xxxx に送信されたSMSコードを入力してください。
          </p>
        </div>
        <InputOTP maxLength={6} value={value} onChange={setValue}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        <div className="flex justify-between">
          <Button variant="outline" size="sm">
            再送信
          </Button>
          <Button disabled={value.length !== 6}>
            確認
          </Button>
        </div>
      </div>
    );
  },
};

export const TwoFactorAuth: Story = {
  render: () => {
    const [value, setValue] = useState("");

    return (
      <div className="space-y-4 max-w-md">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">二要素認証</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            認証アプリから6桁のコードを入力してください。
          </p>
        </div>
        <InputOTP maxLength={6} value={value} onChange={setValue}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        <Button className="w-full" disabled={value.length !== 6}>
          ログイン
        </Button>
      </div>
    );
  },
};

export const CustomLength: Story = {
  render: () => {
    const [value, setValue] = useState("");

    return (
      <div className="space-y-4">
        <div>
          <Label>4桁のPINコードを入力</Label>
        </div>
        <InputOTP maxLength={4} value={value} onChange={setValue}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
          </InputOTPGroup>
        </InputOTP>
        <Button className="w-full" disabled={value.length !== 4}>
          確認
        </Button>
      </div>
    );
  },
};

export const Pattern: Story = {
  render: () => {
    const [value, setValue] = useState("");

    return (
      <div className="space-y-4">
        <div>
          <Label>数字のみ入力可能</Label>
        </div>
        <InputOTP 
          maxLength={6} 
          pattern="^[0-9]+$"
          value={value} 
          onChange={setValue}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          数字のみ入力できます
        </div>
      </div>
    );
  },
};