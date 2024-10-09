function getProductImageUrl(product) {
  let productImageUrl;

  switch (product) {
    case 'optimize':
      productImageUrl = 'https://cdn.discordapp.com/attachments/1111966282343002172/1185451368077598760/ofe.png?ex=66e9119e&is=66e7c01e&hm=c78366b12e6ccb720e565335565e94357ca8c31b242667476bb44a692709b22f&';
      break;
    case 'd1scord_effects':
      productImageUrl = 'https://media.discordapp.net/attachments/1152492381631942697/1286910338821914695/Untitled-6.png?ex=66efa026&is=66ee4ea6&hm=c2f198155a2f7dad3e9e2e1f4289bee5832ab98e9dd64be71ccac17d66683b7e&=&format=webp&quality=lossless&width=440&height=132';
      break;
    case 'd1scord_effects_valorant':
      productImageUrl = 'https://media.discordapp.net/attachments/1152492381631942697/1286701026690203760/1266108773005529118.jpg?ex=66eedd36&is=66ed8bb6&hm=8dc339bb41d46d6b7b776727453e041e63705bf4776667c4410a50be4eb4b9dd&=&format=webp&width=819&height=184';
      break;
    case 'free_tweaks':
      productImageUrl = 'https://media.discordapp.net/attachments/1286352610793619540/1293421247614685194/ezgif-4-41eeb7d381.gif?ex=67074fe8&is=6705fe68&hm=5bc12e4bfada6a5e8828516f2c40fbf52571ccf69556c6675f9c60fcb61f04e2&=&width=440&height=247';
      break;
    case 'free_ffx86':
      productImageUrl = 'https://cdn.discordapp.com/attachments/1152492381631942697/1285983416793432095/ezgif-4-9ae8608781.gif?ex=66ec40e2&is=66eaef62&hm=afc8c02e55b870585a1775a2a38370fc864472106a897e2afcde0fd546a23205&';
      break;
    case 'free_highgraphic':
      productImageUrl = 'https://cdn.discordapp.com/attachments/1284476739891761236/1290665633746386996/ezgif-4-3c1a6833db.gif?ex=66fd498a&is=66fbf80a&hm=90e4925bced01bc44a59279276dca69befae7def6ae774cc592d5a3e6fa3bed7&';
      break;
    case 'free_highpriority':
      productImageUrl = 'https://cdn.discordapp.com/attachments/1284476739891761236/1290665644764827668/ezgif-4-551f30a2e7.gif?ex=66fd498d&is=66fbf80d&hm=8ab061e61f24f91ef9852862eef4abdc9c8617d1553c47c87875f1189c4bed7e&';
      break;
    case 'free_aiolegitvn':
      productImageUrl = 'https://cdn.discordapp.com/attachments/1284476739891761236/1290664898782695469/ezgif-7-a5280ec3ba.gif?ex=66fd48db&is=66fbf75b&hm=fc8bfc08562673e8d53f8b06394708897681a11551070fcb3866d609910e40f3&';
      break;
    case 'free_mousedefault':
      productImageUrl = 'https://cdn.discordapp.com/attachments/1293223252755484717/1293526651740753970/image.png?ex=6707b212&is=67066092&hm=53ce0fa9dc81d1f3a2f12d8f0df2354d1037208bedd9ce8eb8f388109e7b8f7b&';
      break;
    case 'free_fixgpu':
      productImageUrl = 'https://cdn.discordapp.com/attachments/1152492381631942697/1293547895966142464/ezgif-6-5ea7ffd3cb.gif?ex=6707c5db&is=6706745b&hm=f711fdc5ed2c3d83aad27f4ef2fef30170c733cfb9641ab63c6e4f6783d6e75b&';
      break;
    default:
      productImageUrl = 'https://media.discordapp.net/attachments/1106507037724127335/1210862617791307816/tb7m509syt.jpg?ex=66e93ab0&is=66e7e930&hm=8812cee98754d31adc9ad611371d4b4d0c51ebf2c7dffe557587e9985e42cc0a&=&format=webp&width=1024&height=204';
      break;
  }

  return productImageUrl;
}

module.exports = { getProductImageUrl };
