import {type Meta, type StoryObj} from "@storybook/react";
import {RadioGroup, RadioGroupItem} from "./radio-group";
import {Label} from "./label";

const meta: Meta<typeof RadioGroup> = {
  title: "UI/Radio Group",
  component: RadioGroup,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="option1" className="max-w-sm">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option1" id="option1" />
        <Label htmlFor="option1">オプション 1</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option2" id="option2" />
        <Label htmlFor="option2">オプション 2</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option3" id="option3" />
        <Label htmlFor="option3">オプション 3</Label>
      </div>
    </RadioGroup>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">配送方法を選択してください</h3>
      <RadioGroup defaultValue="standard" className="max-w-sm">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="standard" id="standard" />
          <Label htmlFor="standard" className="cursor-pointer">
            <div>
              <div className="font-medium">標準配送</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                5-7営業日 • 送料無料
              </div>
            </div>
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="express" id="express" />
          <Label htmlFor="express" className="cursor-pointer">
            <div>
              <div className="font-medium">速達配送</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                2-3営業日 • ¥500
              </div>
            </div>
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="overnight" id="overnight" />
          <Label htmlFor="overnight" className="cursor-pointer">
            <div>
              <div className="font-medium">翌日配送</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                翌営業日 • ¥1,000
              </div>
            </div>
          </Label>
        </div>
      </RadioGroup>
    </div>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">サイズを選択してください</h3>
      <RadioGroup defaultValue="medium" className="flex space-x-6">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="small" id="small" />
          <Label htmlFor="small">S</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="medium" id="medium" />
          <Label htmlFor="medium">M</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="large" id="large" />
          <Label htmlFor="large">L</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="xl" id="xl" />
          <Label htmlFor="xl">XL</Label>
        </div>
      </RadioGroup>
    </div>
  ),
};

export const WithDisabled: Story = {
  render: () => (
    <RadioGroup defaultValue="available1" className="max-w-sm">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="available1" id="available1" />
        <Label htmlFor="available1">利用可能なオプション 1</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="available2" id="available2" />
        <Label htmlFor="available2">利用可能なオプション 2</Label>
      </div>
      <div className="flex items-center space-x-2 opacity-50">
        <RadioGroupItem value="disabled" id="disabled" disabled />
        <Label htmlFor="disabled">無効なオプション</Label>
      </div>
    </RadioGroup>
  ),
};

export const PaymentMethod: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">支払い方法を選択してください</h3>
      <RadioGroup defaultValue="card" className="max-w-sm space-y-3">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="card" id="card" />
          <Label htmlFor="card" className="cursor-pointer">
            <div className="flex items-center space-x-2">
              <div>クレジットカード</div>
            </div>
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="paypal" id="paypal" />
          <Label htmlFor="paypal" className="cursor-pointer">
            PayPal
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="bank" id="bank" />
          <Label htmlFor="bank" className="cursor-pointer">
            銀行振込
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="cod" id="cod" />
          <Label htmlFor="cod" className="cursor-pointer">
            代金引換
          </Label>
        </div>
      </RadioGroup>
    </div>
  ),
};