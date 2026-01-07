# Danh Sách Product Keys

## Product Keys trong hệ thống

Dựa vào `realtime-database.json`:

### Sản phẩm trả phí:
- `toi_uu_gia_lap` - Tối ưu giả lập (150,000 VND)

### Sản phẩm miễn phí:
- `free_aiolegitvn` - Sản phẩm miễn phí

---

## Cách điền khi tạo voucher

### ✅ Ví dụ đúng:

**Một sản phẩm:**
```
toi_uu_gia_lap
```

**Nhiều sản phẩm:**
```
toi_uu_gia_lap,free_aiolegitvn
```
(Lưu ý: Cách nhau bởi dấu phẩy, KHÔNG có dấu cách)

**Tất cả sản phẩm:**
```
(để trống)
```

### ❌ Ví dụ sai:

```
Tối ưu giả lập          ❌ (không dùng tên hiển thị)
toi_uu_gia_lap, free    ❌ (không có dấu cách sau dấu phẩy)
toiuugialap             ❌ (sai chính tả key)
```

---

## Cách tìm Product Key

1. Mở file `realtime-database.json`
2. Tìm section `productPrices` để xem các product keys
3. Hoặc xem trong `productInfo` > `[category]` > `subProducts`

**Công thức:**
```
Category "optimize" → SubProduct "toi_uu_gia_lap" → Giá trong productPrices
```
