import { type Meta, type StoryObj } from "@storybook/react";
import { Separator } from "./separator";

const meta: Meta<typeof Separator> = {
  title: "UI/Separator",
  component: Separator,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Separator>;

export const Default: Story = {};

export const Vertical: Story = {
  args: {
    orientation: "vertical",
    className: "h-[20px]",
  },
};

export const WithText: Story = {
  render: () => (
    <div>
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">Radix Primitives</h4>
        <p className="text-sm text-muted-foreground">
          An open-source UI component library.
        </p>
      </div>
      <Separator className="my-4" />
      <div className="flex h-5 items-center space-x-4 text-sm">
        <div>Blog</div>
        <Separator orientation="vertical" />
        <div>Docs</div>
        <Separator orientation="vertical" />
        <div>Source</div>
      </div>
    </div>
  ),
};

export const InForm: Story = {
  render: () => (
    <div className="w-full max-w-md space-y-4">
      <div>
        <label className="text-sm font-medium">Name</label>
        <input className="w-full mt-1 px-3 py-2 border rounded-md" placeholder="Enter your name" />
      </div>
      <Separator />
      <div>
        <label className="text-sm font-medium">Email</label>
        <input className="w-full mt-1 px-3 py-2 border rounded-md" type="email" placeholder="Enter your email" />
      </div>
      <Separator />
      <div>
        <label className="text-sm font-medium">Bio</label>
        <textarea className="w-full mt-1 px-3 py-2 border rounded-md" rows={3} placeholder="Tell us about yourself" />
      </div>
    </div>
  ),
};

export const Decorative: Story = {
  render: () => (
    <div className="w-full max-w-lg">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Welcome Back</h2>
        <p className="text-muted-foreground">Sign in to your account to continue</p>
        <div className="flex items-center gap-4">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground uppercase">or</span>
          <Separator className="flex-1" />
        </div>
        <p className="text-sm text-muted-foreground">Continue with social accounts</p>
      </div>
    </div>
  ),
};
