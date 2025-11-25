import { type Meta, type StoryObj } from '@storybook/react';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from './menubar';

const meta: Meta<typeof Menubar> = {
  title: 'UI/Menubar',
  component: Menubar,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Menubar>;

export const Default: Story = {
  render: () => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>ファイル</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            新規 <MenubarShortcut>⌘T</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            開く <MenubarShortcut>⌘O</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>保存</MenubarItem>
          <MenubarItem disabled>名前を付けて保存</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>編集</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>元に戻す</MenubarItem>
          <MenubarItem>やり直し</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>切り取り</MenubarItem>
          <MenubarItem>コピー</MenubarItem>
          <MenubarItem>貼り付け</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};