export const decodeBinary = async <Type>(data: Blob, Schema: any) => {
  if (data.arrayBuffer) {
    const buffer = await data.arrayBuffer();
    return Schema.deserializeBinary(buffer as Uint8Array) as Type;
  }

  return Schema.deserializeBinary(data) as Type;
};
