-- SkinSight「我的护肤台」数据表
-- 在 Supabase 控制台的 SQL Editor 里整段执行即可。
-- 存放用户「正在使用的产品」库，每行一个产品，绑定到登录用户。

create table if not exists public.shelf_items (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  source        text not null default 'product',          -- 'product'（产品库选中）| 'scan'（识别成分表）
  product_id    text,                                      -- 命中产品库时的产品 id
  name          text not null,                             -- 展示名
  brand_cn      text,                                      -- 品牌中文名（产品库来源时）
  category      text,                                      -- 品类（精华/面霜/防晒…），用于早晚流程排序
  ingredient_ids text[] not null default '{}',             -- 成分 id 列表
  thumbnail     text,                                      -- 可选：上传图片的 data URL
  created_at    timestamptz not null default now()
);

-- 按用户查询的索引
create index if not exists shelf_items_user_id_idx on public.shelf_items (user_id, created_at);

-- 行级安全：每个用户只能读写自己的行
alter table public.shelf_items enable row level security;

drop policy if exists "shelf_items_select_own" on public.shelf_items;
create policy "shelf_items_select_own" on public.shelf_items
  for select using (auth.uid() = user_id);

drop policy if exists "shelf_items_insert_own" on public.shelf_items;
create policy "shelf_items_insert_own" on public.shelf_items
  for insert with check (auth.uid() = user_id);

drop policy if exists "shelf_items_update_own" on public.shelf_items;
create policy "shelf_items_update_own" on public.shelf_items
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "shelf_items_delete_own" on public.shelf_items;
create policy "shelf_items_delete_own" on public.shelf_items
  for delete using (auth.uid() = user_id);
