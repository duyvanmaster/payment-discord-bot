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
        productImageUrl = 'https://r2.e-z.host/2825fb47-f8a4-472c-9624-df2489f897c0/ag94wqb0.gif';
        break;
      case 'free_ffx86':
        productImageUrl = 'https://cdn.discordapp.com/attachments/1152492381631942697/1285983416793432095/ezgif-4-9ae8608781.gif?ex=66ec40e2&is=66eaef62&hm=afc8c02e55b870585a1775a2a38370fc864472106a897e2afcde0fd546a23205&';
        break;
        case 'free_highgraphic':
          productImageUrl = 'https://r2.e-z.host/2825fb47-f8a4-472c-9624-df2489f897c0/5lpp28w8.gif';
          break;
          case 'free_highpriority':
            productImageUrl = 'https://r2.e-z.host/2825fb47-f8a4-472c-9624-df2489f897c0/wameoe14.gif';
            break;
            case 'free_aiolegitvn':
              productImageUrl = 'https://cdn.discordapp.com/attachments/1284476739891761236/1290664898782695469/ezgif-7-a5280ec3ba.gif?ex=66fd48db&is=66fbf75b&hm=fc8bfc08562673e8d53f8b06394708897681a11551070fcb3866d609910e40f3&';
              break;
      default:
        productImageUrl = 'https://media.discordapp.net/attachments/1106507037724127335/1210862617791307816/tb7m509syt.jpg?ex=66e93ab0&is=66e7e930&hm=8812cee98754d31adc9ad611371d4b4d0c51ebf2c7dffe557587e9985e42cc0a&=&format=webp&width=1024&height=204';
        break;
    }
  
    return productImageUrl;
  }
  
  module.exports = { getProductImageUrl };
  