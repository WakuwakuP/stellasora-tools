import {type Meta, type StoryObj} from "@storybook/react";
import {Toggle} from "./toggle";
import {Bold, Italic, Underline} from "lucide-react";

const meta: Meta<typeof Toggle> = {
  title: "UI/Toggle",
  component: Toggle,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Toggle>;

export const Default: Story = {
  args: {
    children: "Toggle",
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex gap-2">
      <Toggle variant="default" aria-label="Default toggle">
        Default
      </Toggle>
      <Toggle variant="outline" aria-label="Outline toggle">
        Outline
      </Toggle>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Toggle size="sm" aria-label="Small toggle">
        Small
      </Toggle>
      <Toggle size="default" aria-label="Default toggle">
        Default
      </Toggle>
      <Toggle size="lg" aria-label="Large toggle">
        Large
      </Toggle>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex gap-2">
      <Toggle aria-label="Bold">
        <Bold />
      </Toggle>
      <Toggle aria-label="Italic">
        <Italic />
      </Toggle>
      <Toggle aria-label="Underline">
        <Underline />
      </Toggle>
    </div>
  ),
};

export const TextEditor: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">テキストエディタの書式設定</h3>
      <div className="flex gap-1 p-2 border rounded-md">
        <Toggle aria-label="太字">
          <Bold />
        </Toggle>
        <Toggle aria-label="斜体">
          <Italic />
        </Toggle>
        <Toggle aria-label="下線">
          <Underline />
        </Toggle>
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex gap-2">
      <Toggle disabled aria-label="Disabled toggle">
        無効
      </Toggle>
      <Toggle disabled pressed aria-label="Disabled pressed toggle">
        無効 (押下状態)
      </Toggle>
    </div>
  ),
};

export const Pressed: Story = {
  render: () => (
    <div className="flex gap-2">
      <Toggle pressed aria-label="Pressed toggle">
        押下状態
      </Toggle>
      <Toggle variant="outline" pressed aria-label="Outline pressed toggle">
        押下状態 (Outline)
      </Toggle>
    </div>
  ),
};

export const WithText: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">表示オプション</h3>
      <div className="flex flex-wrap gap-2">
        <Toggle aria-label="通知を表示">
          通知を表示
        </Toggle>
        <Toggle aria-label="サイドバーを表示">
          サイドバーを表示
        </Toggle>
        <Toggle aria-label="ツールバーを表示">
          ツールバーを表示
        </Toggle>
      </div>
    </div>
  ),
};