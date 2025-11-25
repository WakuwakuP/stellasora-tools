import {type Meta, type StoryObj} from "@storybook/react";
import {Button} from "./button";

type ButtonType = typeof Button;

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: "Button",
  },
};

export const Variants: Story = {
  args: {
    children: "Button",
  },
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
    },
  },
  render: (args) => (
    <div className="flex gap-2">
      <Button {...args} variant="default">Default</Button>
      <Button {...args} variant="destructive">Destructive</Button>
      <Button {...args} variant="outline">Outline</Button>
      <Button {...args} variant="secondary">Secondary</Button>
      <Button {...args} variant="ghost">Ghost</Button>
      <Button {...args} variant="link">Link</Button>
    </div>
  ),
};

export const Sizes: Story = {
  args: {
    children: "Button",
  },
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["default", "sm", "lg", "icon"],
    },
  },
  render: (args) => (
    <div className="flex gap-2">
      <Button {...args} size="default">Default</Button>
      <Button {...args} size="sm">Small</Button>
      <Button {...args} size="lg">Large</Button>
      <Button {...args} size="icon">Icon</Button>
    </div>
  ),
};
