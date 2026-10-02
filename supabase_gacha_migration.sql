-- กาชา + แลกโค้ดเซ็ตพิเศษ — รันไฟล์นี้ไฟล์เดียวใน Supabase SQL Editor ได้เลย (รันซ้ำได้ปลอดภัย)
-- เรียกได้เฉพาะ service role จากฟังก์ชันเซิร์ฟเวอร์ (เบราว์เซอร์เรียกไม่ได้)

-- หมุนกาชา: หักเหรียญ + ใส่ของ (หรือถ้าซ้ำ → หักเหรียญแล้วคืนบางส่วน) ใน transaction เดียว ล็อกแถวกระเป๋ากันหมุนซ้อน
create or replace function public.ww_wallet_spin(p_wallet uuid, p_cost int, p_item text, p_refund int)
returns jsonb language plpgsql security invoker set search_path = public as $$
declare w public.ww_wallets%rowtype;
begin
  select * into w from public.ww_wallets where wallet_id = p_wallet for update;
  if not found then return jsonb_build_object('ok', false, 'reason', 'none'); end if;
  if w.coins < p_cost then return jsonb_build_object('ok', false, 'reason', 'poor'); end if;
  if w.owned ? p_item then
    update public.ww_wallets set coins = coins - p_cost + greatest(p_refund, 0) where wallet_id = p_wallet;
    return jsonb_build_object('ok', true, 'duplicate', true);
  end if;
  update public.ww_wallets set coins = coins - p_cost, owned = owned || to_jsonb(p_item) where wallet_id = p_wallet;
  return jsonb_build_object('ok', true, 'duplicate', false);
end
$$;

-- ให้ของหลายชิ้น (แลกโค้ด): ข้ามชิ้นที่มีแล้ว คืนจำนวนที่เพิ่มจริง
create or replace function public.ww_wallet_grant(p_wallet uuid, p_items text[])
returns int language plpgsql security invoker set search_path = public as $$
declare w public.ww_wallets%rowtype; it text; added int := 0; cur jsonb;
begin
  select * into w from public.ww_wallets where wallet_id = p_wallet for update;
  if not found then return null; end if;
  cur := w.owned;
  foreach it in array p_items loop
    if not (cur ? it) then cur := cur || to_jsonb(it); added := added + 1; end if;
  end loop;
  update public.ww_wallets set owned = cur where wallet_id = p_wallet;
  return added;
end
$$;

revoke all on function public.ww_wallet_spin(uuid, int, text, int) from public, anon, authenticated;
revoke all on function public.ww_wallet_grant(uuid, text[]) from public, anon, authenticated;
