# 05 — Database (Supabase)

## 1. Aturan umum
- Uang = `integer` rupiah (tanpa desimal).
- Waktu = `timestamptz` (UTC), tampil WIB.
- `order_items.name` dan `.price` adalah **snapshot** (D13).
- Status order hanya: `baru`, `dimasak`, `selesai`.
- Perubahan skema wajib: perbarui file ini + catat di `10-CONTEXT-LOG.md`.
- Jalankan SQL lewat **Supabase SQL Editor**. Simpan setiap perubahan sebagai file di `supabase/migrations/` (nama `YYYYMMDDHHmm_deskripsi.sql`) bila repo memakainya.

## 2. Diagram relasi

```
categories 1───* menu_items 1───* menu_variants
                    │
                    └──(snapshot, on delete set null)──┐
orders 1───* order_items ◄─────────────────────────────┘
settings (1 baris)
```

## 3. Skema (SQL)

```sql
create extension if not exists pgcrypto;

-- KATEGORI
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- MENU
create table menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete set null,
  name text not null,
  price int not null check (price >= 0),
  image_url text,
  is_active boolean not null default true,
  variant_label text default 'Varian',
  variant_pick int not null default 0 check (variant_pick >= 0),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- VARIAN
create table menu_variants (
  id uuid primary key default gen_random_uuid(),
  menu_item_id uuid not null references menu_items(id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  unique (menu_item_id, name)
);

-- PENGATURAN (satu baris)
create table settings (
  id int primary key default 1 check (id = 1),
  store_name text not null default 'Cemal Cemul',
  tax_percent numeric(5,2) not null default 0 check (tax_percent >= 0 and tax_percent <= 100),
  updated_at timestamptz not null default now()
);
insert into settings (id) values (1) on conflict do nothing;

-- PESANAN
create table orders (
  id uuid primary key default gen_random_uuid(),
  order_no bigint generated always as identity,
  customer_name text,
  order_type text not null default 'dine_in' check (order_type in ('dine_in','take_away')),
  table_no text,
  note text,
  subtotal int not null check (subtotal >= 0),
  discount_type text check (discount_type in ('percent','amount')),
  discount_value int not null default 0 check (discount_value >= 0),
  discount int not null default 0 check (discount >= 0),
  tax_percent numeric(5,2) not null default 0,
  tax int not null default 0 check (tax >= 0),
  total int not null check (total >= 0),
  payment_method text not null check (payment_method in ('cash','qris','transfer')),
  payment_proof_url text,
  status text not null default 'baru' check (status in ('baru','dimasak','selesai')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  cooking_at timestamptz,
  done_at timestamptz
);

-- ITEM PESANAN
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  menu_item_id uuid references menu_items(id) on delete set null,
  name text not null,
  price int not null check (price >= 0),
  qty int not null check (qty > 0),
  variants text[] not null default '{}',
  note text
);

-- INDEKS
create index orders_status_created_idx on orders (status, created_at desc);
create index orders_created_idx on orders (created_at desc);
create index order_items_order_idx on order_items (order_id);
create index menu_items_category_idx on menu_items (category_id);
create index menu_variants_item_idx on menu_variants (menu_item_id);
```

Catatan desain:
- `payment_method not null` mengikuti asumsi A7 (wajib). Jika user menjawab tidak wajib, ubah menjadi nullable dan catat.
- `tax_percent` disimpan **per pesanan** agar riwayat tidak berubah saat pajak diubah.
- `discount_type/discount_value` menyimpan input asli; `discount` adalah hasil rupiah.
- `order_no` memakai identity; reset harian **tidak** dilakukan (A11).

## 4. Trigger `updated_at` dan timestamp status

```sql
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger orders_set_updated before update on orders
  for each row execute function set_updated_at();
create trigger menu_items_set_updated before update on menu_items
  for each row execute function set_updated_at();
create trigger settings_set_updated before update on settings
  for each row execute function set_updated_at();

create or replace function set_status_timestamps() returns trigger as $$
begin
  if new.status = 'dimasak' and old.status is distinct from 'dimasak' then
    new.cooking_at = now();
  end if;
  if new.status = 'selesai' and old.status is distinct from 'selesai' then
    new.done_at = now();
  end if;
  return new;
end;
$$ language plpgsql;

create trigger orders_status_ts before update on orders
  for each row execute function set_status_timestamps();
```

## 5. Seed menu (dari poster)

```sql
insert into categories (name, sort_order) values ('Makanan', 1), ('Minuman', 2);

insert into menu_items (category_id, name, price, variant_label, variant_pick, sort_order)
select c.id, v.name, v.price, 'Varian', v.pick, v.ord
from (values
  ('Makanan','Mix Platter', 15000, 3, 1),
  ('Makanan','French Toast', 13000, 1, 2),   -- [ASUMSI A2]
  ('Minuman','Single Cemul', 9000, 1, 3),    -- [ASUMSI A2]
  ('Minuman','Couple Cemul', 14000, 2, 4)
) as v(cat, name, price, pick, ord)
join categories c on c.name = v.cat;

insert into menu_variants (menu_item_id, name, sort_order)
select m.id, v.name, v.ord
from (values
  ('Mix Platter','Kentang',1),('Mix Platter','Nugget',2),('Mix Platter','Sosis',3),('Mix Platter','Mie Goreng',4),
  ('French Toast','Gurih',1),('French Toast','Karamel',2),('French Toast','Coklat',3),('French Toast','Madu',4),('French Toast','Gula',5),
  ('Single Cemul','Mangga',1),('Single Cemul','Anggur',2),('Single Cemul','Sirsak',3),('Single Cemul','Jeruk',4),('Single Cemul','Apel',5),
  ('Couple Cemul','Mangga',1),('Couple Cemul','Anggur',2),('Couple Cemul','Sirsak',3),('Couple Cemul','Jeruk',4),('Couple Cemul','Apel',5)
) as v(item, name, ord)
join menu_items m on m.name = v.item;
```

## 6. Transaksi pembuatan pesanan (disarankan RPC)

Untuk memastikan `orders` dan `order_items` tersimpan atomik, buat fungsi Postgres dan panggil lewat `supabase.rpc(...)` dari server.

```sql
create or replace function create_order(p_order jsonb, p_items jsonb)
returns orders
language plpgsql
as $$
declare
  new_order orders;
begin
  insert into orders (
    customer_name, order_type, table_no, note,
    subtotal, discount_type, discount_value, discount,
    tax_percent, tax, total, payment_method
  ) values (
    p_order->>'customer_name',
    p_order->>'order_type',
    p_order->>'table_no',
    p_order->>'note',
    (p_order->>'subtotal')::int,
    p_order->>'discount_type',
    coalesce((p_order->>'discount_value')::int, 0),
    coalesce((p_order->>'discount')::int, 0),
    coalesce((p_order->>'tax_percent')::numeric, 0),
    coalesce((p_order->>'tax')::int, 0),
    (p_order->>'total')::int,
    p_order->>'payment_method'
  ) returning * into new_order;

  insert into order_items (order_id, menu_item_id, name, price, qty, variants, note)
  select new_order.id,
         nullif(i->>'menu_item_id','')::uuid,
         i->>'name',
         (i->>'price')::int,
         (i->>'qty')::int,
         coalesce(array(select jsonb_array_elements_text(i->'variants')), '{}'),
         i->>'note'
  from jsonb_array_elements(p_items) as i;

  return new_order;
end;
$$;
```
Hitungan angka tetap dilakukan di server Next.js (`lib/pricing.ts`); fungsi ini hanya menyimpan secara atomik. Bila RPC dirasa berlebihan, alternatifnya insert dua tahap dengan rollback manual (hapus order bila insert item gagal).

## 7. Storage

| Bucket | Isi | Akses baca | Akses tulis |
|---|---|---|---|
| `payment-proofs` | foto bukti bayar | publik (URL langsung) | hanya server (service role) |
| `menu-images` | gambar menu | publik | hanya server |

- Nama file: `payment-proofs/{order_id}/{epoch_ms}.jpg`, `menu-images/{menu_id}/{epoch_ms}.jpg`.
- Batas ukuran dan MIME divalidasi di server.
- Alternatif privasi: bucket privat + signed URL (butuh keputusan user).

## 8. Realtime

```sql
alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table order_items;
```
Event dipakai sebagai pemicu refetch (lihat `04-ARCHITECTURE.md` §7).

## 9. RLS

```sql
alter table categories    enable row level security;
alter table menu_items    enable row level security;
alter table menu_variants enable row level security;
alter table settings      enable row level security;
alter table orders        enable row level security;
alter table order_items   enable row level security;

-- Service role melewati RLS otomatis.
-- Anon: hanya SELECT pada orders (dibutuhkan agar Realtime Postgres Changes dapat berjalan).
create policy "anon read orders" on orders
  for select to anon using (true);
create policy "anon read order_items" on order_items
  for select to anon using (true);
-- TIDAK ada policy INSERT/UPDATE/DELETE untuk anon.
```
**Peringatan jujur (A12):** dengan policy di atas, siapa pun yang memegang anon key dapat membaca isi `orders` dan `order_items` lewat REST API Supabase, termasuk total dan metode bayar. UI Dapur tidak menampilkannya, tetapi datanya secara teknis terbaca. Jika user keberatan, gunakan **Opsi B (Broadcast)** pada `04-ARCHITECTURE.md` dan hapus kedua policy di atas.

Untuk `categories`, `menu_items`, `menu_variants`, `settings`: **tanpa policy anon** (hanya diakses server).

## 10. Kamus data singkat

| Tabel.kolom | Arti |
|---|---|
| `menu_items.variant_pick` | 0 = tanpa varian; N = wajib pilih N varian |
| `menu_items.variant_label` | Teks label di dialog, mis. "Varian" |
| `orders.order_type` | `dine_in` / `take_away` |
| `orders.discount_type` | `percent` / `amount` / null |
| `orders.discount_value` | Input asli (persen atau rupiah) |
| `orders.discount` | Hasil diskon dalam rupiah |
| `orders.tax_percent` | Pajak yang berlaku saat pesanan dibuat |
| `orders.status` | `baru` → `dimasak` → `selesai` |
| `orders.cooking_at` / `done_at` | Waktu masuk status tersebut |
| `order_items.variants` | Array nama varian terpilih (snapshot) |

## 11. Query acuan

Pesanan aktif untuk dapur (tanpa uang), urut terlama:
```sql
select o.id, o.order_no, o.customer_name, o.order_type, o.table_no, o.note,
       o.status, o.created_at,
       json_agg(json_build_object('name', i.name, 'qty', i.qty, 'variants', i.variants, 'note', i.note)
                order by i.name) as items
from orders o
join order_items i on i.order_id = o.id
where o.status in ('baru','dimasak')
group by o.id
order by o.created_at asc;
```

Ringkasan penjualan hari ini (WIB):
```sql
select count(*) as jumlah_pesanan, coalesce(sum(total),0) as total_penjualan
from orders
where created_at >= (date_trunc('day', now() at time zone 'Asia/Jakarta') at time zone 'Asia/Jakarta');
```

## 12. Reset data uji (hanya development)

```sql
-- HATI-HATI: menghapus semua pesanan
truncate order_items, orders restart identity cascade;
```
Jangan jalankan di produksi tanpa izin eksplisit user.

## 13. Checklist setup Supabase

- [ ] Jalankan SQL skema, trigger, RPC
- [ ] Jalankan seed
- [ ] Buat bucket `payment-proofs` dan `menu-images` (publik-baca)
- [ ] Aktifkan Realtime untuk `orders` (dan `order_items`)
- [ ] Atur RLS (§9)
- [ ] Salin URL, anon key, service role key ke `.env.local` **oleh user sendiri**
