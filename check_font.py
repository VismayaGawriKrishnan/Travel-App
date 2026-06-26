import struct

with open('my-app/assets/Serpentine-Bold.ttf', 'rb') as f:
    data = f.read()

num_tables = struct.unpack('>H', data[4:6])[0]

tables = {}
for i in range(num_tables):
    tag = data[12 + i*16:12 + i*16 + 4].decode('ascii')
    offset = struct.unpack('>I', data[12 + i*16 + 8:12 + i*16 + 12])[0]
    length = struct.unpack('>I', data[12 + i*16 + 12:12 + i*16 + 16])[0]
    tables[tag] = (offset, length)

name_offset, name_length = tables['name']
name_data = data[name_offset:name_offset + name_length]

count = struct.unpack('>H', name_data[2:4])[0]
string_offset = struct.unpack('>H', name_data[4:6])[0]

print('=== Font Name Records ===')
for i in range(count):
    rec = name_data[6 + i*12: 6 + i*12 + 12]
    platform_id = struct.unpack('>H', rec[0:2])[0]
    name_id = struct.unpack('>H', rec[6:8])[0]
    length = struct.unpack('>H', rec[8:10])[0]
    str_off = struct.unpack('>H', rec[10:12])[0]
    value_bytes = name_data[string_offset + str_off: string_offset + str_off + length]
    try:
        value = value_bytes.decode('utf-16-be') if platform_id == 3 else value_bytes.decode('latin-1')
        if name_id in [1, 2, 4, 6]:
            label = {1: 'Family', 2: 'Subfamily', 4: 'Full Name', 6: 'PostScript Name'}.get(name_id, str(name_id))
            print(f'  platformID={platform_id} {label} -> "{value}"')
    except Exception as e:
        pass
