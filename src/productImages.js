function getProductImageUrl(product) {
    let productImageUrl;

    switch (product) {
      case 'product_1':
        productImageUrl = 'https://cdn.discordapp.com/attachments/1111966282343002172/1185451368077598760/ofe.png?ex=66e9119e&is=66e7c01e&hm=c78366b12e6ccb720e565335565e94357ca8c31b242667476bb44a692709b22f&';
        break;
      case 'product_1_1':
        productImageUrl = 'https://cdn.discordapp.com/attachments/1111966282343002172/1185451368077598760/ofe.png?ex=66e9119e&is=66e7c01e&hm=c78366b12e6ccb720e565335565e94357ca8c31b242667476bb44a692709b22f&';
        break;
      case 'legit_ffx86':
        productImageUrl = 'https://cdn.discordapp.com/attachments/1152492381631942697/1285983416793432095/ezgif-4-9ae8608781.gif?ex=66ec40e2&is=66eaef62&hm=afc8c02e55b870585a1775a2a38370fc864472106a897e2afcde0fd546a23205&';
        break;
      default:
        productImageUrl = 'https://media.discordapp.net/attachments/1106507037724127335/1210862617791307816/tb7m509syt.jpg?ex=66e93ab0&is=66e7e930&hm=8812cee98754d31adc9ad611371d4b4d0c51ebf2c7dffe557587e9985e42cc0a&=&format=webp&width=1024&height=204';
        break;
    }
  
    return productImageUrl;
  }
  
  module.exports = { getProductImageUrl };
  