import {type Meta, type StoryObj} from "@storybook/react";
import {ToggleGroup, ToggleGroupItem} from "./toggle-group";
import {Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight} from "lucide-react";

const meta: Meta<typeof ToggleGroup> = {
  title: "UI/Toggle Group",
  component: ToggleGroup,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof ToggleGroup>;

export const Default: Story = {
  render: () => (
    <ToggleGroup type="multiple" aria-label="Text formatting">
      <ToggleGroupItem value="bold" aria-label="太字">
        <Bold />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="斜体">
        <Italic />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="下線">
        <Underline />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const SingleSelection: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">テキストの配置</h3>
      <ToggleGroup type="single" defaultValue="left" aria-label="Text alignment">
        <ToggleGroupItem value="left" aria-label="左揃え">
          <AlignLeft />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="中央揃え">
          <AlignCenter />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="右揃え">
          <AlignRight />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
};

export const Outline: Story = {
  render: () => (
    <ToggleGroup type="multiple" variant="outline" aria-label="Text formatting">
      <ToggleGroupItem value="bold" aria-label="太字">
        <Bold />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="斜体">
        <Italic />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="下線">
        <Underline />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium mb-2">Small</h4>
        <ToggleGroup type="multiple" size="sm" aria-label="Small text formatting">
          <ToggleGroupItem value="bold" aria-label="太字">
            <Bold />
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="斜体">
            <Italic />
          </ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label="下線">
            <Underline />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-2">Default</h4>
        <ToggleGroup type="multiple" aria-label="Default text formatting">
          <ToggleGroupItem value="bold" aria-label="太字">
            <Bold />
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="斜体">
            <Italic />
          </ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label="下線">
            <Underline />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-2">Large</h4>
        <ToggleGroup type="multiple" size="lg" aria-label="Large text formatting">
          <ToggleGroupItem value="bold" aria-label="太字">
            <Bold />
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="斜体">
            <Italic />
          </ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label="下線">
            <Underline />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  ),
};

export const WithText: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">表示設定</h3>
      <ToggleGroup type="multiple" variant="outline" aria-label="Display options">
        <ToggleGroupItem value="sidebar">サイドバー</ToggleGroupItem>
        <ToggleGroupItem value="toolbar">ツールバー</ToggleGroupItem>
        <ToggleGroupItem value="footer">フッター</ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
};

export const ViewModes: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">表示モード</h3>
      <ToggleGroup type="single" defaultValue="grid" variant="outline" aria-label="View mode">
        <ToggleGroupItem value="list">リスト表示</ToggleGroupItem>
        <ToggleGroupItem value="grid">グリッド表示</ToggleGroupItem>
        <ToggleGroupItem value="card">カード表示</ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <ToggleGroup type="multiple" aria-label="Text formatting with disabled item">
      <ToggleGroupItem value="bold" aria-label="太字">
        <Bold />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" disabled aria-label="斜体 (無効)">
        <Italic />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="下線">
        <Underline />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};