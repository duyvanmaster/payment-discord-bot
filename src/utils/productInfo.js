const { Emoji } = require("discord.js");

const productInfo = {
  regedit: {
      title: 'Regedit',
      description: '```yaml\nCác tính năng và tác dụng của Regedit Limited & Config```\n<:regedit:1066225725574742126>  **Regedit Limited**\n<a:arrow:1293222327126982737> Hỗ trợ Windows 10/11\n<a:arrow:1293222327126982737> Tương thích với Bluestacks và MsiPlayer\n<a:arrow:1293222327126982737> Tối ưu hóa Registry\n<a:arrow:1293222327126982737> Loại bỏ config cũ, tùy chỉnh sâu thông số Registry\n<a:arrow:1293222327126982737> Tinh chỉnh giả lập để tăng độ ổn định\n<a:arrow:1293222327126982737> Cài đặt và cập nhật các thành phần Registry cần thiết của file\n<a:arrow:1293222327126982737> Cải thiện trải nghiệm kéo tâm\n\n<:regedit:1066225725574742126>  **Regedit Config**\n<a:arrow:1293222327126982737> Bao gồm tất cả tính năng của Limited\n<a:arrow:1293222327126982737> Nâng cao hiệu suất\n<a:arrow:1293222327126982737> Tăng tốc độ phản hồi\n<a:arrow:1293222327126982737> Và tích hợp gamesense cho cài đặt độ nhạy',
      emoji: '1066225725574742126',
      subProducts: {
          regedit_limited: {
              emoji: '1286356371536613416',
              title: 'Regedit Limited',
              description: '300.000VND',
          },
          regedit_config: {
              emoji: '1286356371536613416',
              title: 'Regedit Config',
              description: '800.000VND',
          },
      },
  },
  optimize: {
      title: 'Tối ưu giả lập',
      description: '```yaml\nCác tính năng và tác dụng của TỐI ƯU GIẢ LẬP```\n<a:arrow:1293222327126982737> Tinh chỉnh các setting cần thiết trong giả lập\n<a:arrow:1293222327126982737> Tối ưu hóa giả lập bằng những phương pháp thủ công và tools độc quyền của LegitVN\n<a:arrow:1293222327126982737> Tinh chỉnh hệ thống máy tính để có thể chạy mượt mà nhất trong tầm cấu hình của bạn\n<a:arrow:1293222327126982737> Ngoài ra còn cài đặt các phần thiết yếu cho giả lập nếu người dùng cần',
      emoji: '1286356032901349477',
      subProducts: {
          toi_uu_gia_lap: {
              title: 'Tối ưu Giả lập & PC',
              description: '150.000 VND',
          },
      },
  },
  free: {
      title: 'Miễn phí',
      description: '```yaml\nCác dịch vụ miễn phí của LegitVN```\n<a:arrow:1293222327126982737> **AIO LegitVN**\n<a:arrow:1293222327126982737> **FFX86**\n<a:arrow:1293222327126982737> **Tweaks**\n<a:arrow:1293222327126982737> **Set High All Priority**\n<a:arrow:1293222327126982737> **Set High Application Performance Graphics Setting**',
    emoji: '🎁',
      subProducts: {
        free_aiolegitvn: {
            title: 'AIO LegitVN',
            emoji: '1066245230644441098',
          },
          free_ffx86: {
              title: 'FFX86', 
              emoji: '1290316637861449769', 
          },
          free_tweaks: {
              title: 'Tweaks',
              emoji: '1290315746785759244',
          },
          free_highpriority: {
            title: 'Set High All Priority',
            emoji: '1286356371536613416',
        },
        free_highgraphic: {
            title: 'Set High Application Performance Graphics Setting',
            emoji: '1286356371536613416',
        },

      },
  },

//   d1scord: {
//     title: 'Dịch vụ D1scord',
//     description: 'Thông tin về dịch vụ D1scord.',
//     emoji: '1286579047777833000',
//     subProducts: {
//       d1scord_service: {
//         title: 'N1tro D1scord',
//         emoji: '1286583138725662760',
//         subProducts: {
//         // nitro_login: {
//         //     title: 'Nitro Login - 65K',
//         //     emoji: '1286583141729042493',
//         // },
//         d1scord_nitro_gift: {
//             title: 'Nitro Gift 1 Month - 70K',
//             emoji: '1286583138725662760',
//         },
//         d1scord_nitro_firts: {
//             title: 'Nitro Boost lần đầu 3 Month - 35K',
//             emoji: '1286583135399710810', 
//         },
//         d1scord_boost_server: {
//             title: '14 Boost Server - 150K',
//             emoji: '1286583133440839742',
//         },
//         },
//       },
//       d1scord_effects: {
//         title: 'Hiệu ứng Avatar và hồ sơ D1scord',
//         emoji: '1287433114271875082',
//         subProducts: {
//           d1scord_effects_autmn_equinox: {
//             title: 'AUTUMN EQUINOX',
//             subProducts:{
//                   hoa_cuc_hoang_hon: {
//                     title: 'Hoa Cúc Hoàng Hôn',
//                     emoji: '1287340091777355797',
//                   },
//                   hoa_cuc_buoi_sang: {
//                     title: 'Hoa Cúc Buổi Sáng',
//                     emoji: '1287340666128695328',
//                   },
//                   hoang_hon_binh_minh: {
//                     title: 'Hoàng Hôn & Bình Minh',
//                     emoji: '1287338115609919528',
//                   },
//                   hop_am_hoa: {
//                     title: 'Hợp Âm Hoa',
//                     emoji: '1287339983182626816',
//                   },
//                   vom_cay_mua_thu: {
//                     title: 'Vòm Cây Mùa Thu',
//                     emoji: '1287338155451879554',
//                   },
//                   vuong_mien_mua_thu: {
//                     title: 'Vương Miện Mùa Thu',
//                     emoji: '1287338118277496933',
//                   },
//                   dien_mao_mat_trang: {
//                     title: 'Diện Mạo Mặt Trăng',
//                     emoji: '1287338105627742289',
//                   },
//                   lum_cay_chang_vang: {
//                     title: 'Lùm Cây Chạng Vạng',
//                     emoji: '1287340113701113866',
//                   },
//                   lum_cay_binh_minh: {
//                     title: 'Lùm Cây Bình Minh',
//                     emoji: '1287340106365009930',
//                   },
//                   thu_phan: {
//                     title: 'Thu Phân',
//                     emoji: '1287340101239836712',
//                   },
//                   mat_troi_mat_trang: {
//                     title: 'Mặt Trời & Mặt Trăng',
//                     emoji: '1287340108730601582',
//                   },
//             }
//           },
//           d1scord_effects_fall: {
//             title: 'FALL',
//             subProducts: {
//               mu_cao: {
//                 title: 'Mũ Cáo',
//                 emoji: '1287343498156310571'
//               },
//               mu_cao_hat_de: {
//                 title: 'Mũ Cáo Hạt Dẻ',
//                 emoji: '1287343500328829000'
//               },
//               mu_cao_tuyet: {
//                 title: 'Mũ Cáo Tuyết',
//                 emoji: '1287343633523277834'
//               },
//               la_mua_thu: {
//                 title: 'Lá Mùa Thu',
//                 emoji: '1287343628615680071'
//               },
//               la_do_tuoi: {
//                 title: 'Lá Đỏ Tươi',
//                 emoji: '1287343631191117824'
//               },
//               la_xanh_mat: {
//                 title: 'Lá Xanh Mát',
//                 emoji: '1287343502946078720'
//               },
//               tan_la_mua_thu: {
//                 title: 'Tán Lá Mùa Thu',
//                 emoji: '1287344740181868555'
//               },
//               tan_la_mua_thu_do_tuoi: {
//                 title: 'Tán Lá Mùa Thu Đỏ Tươi',
//                 emoji: '1287343637625307198'
//               },
//               tan_la_mua_thu_xanh_mat: {
//                 title: 'Tán Lá Mùa Thu Xanh Mát',
//                 emoji: '1287343640192225300'
//               },
//               doi_beo_troi: {
//                 title: 'Đới Bèo Trôi',
//                 emoji: '1287343642389774420'
//               },
//               doi_beo_troi_nua_dem: {
//                 title: 'Đới Bèo Trôi Nửa Đêm',
//                 emoji: '1287343653647290450'
//               },
//               doi_beo_troi_lam_bun: {
//                 title: 'Đới Bèo Trôi Lấm Bùn',
//                 emoji: '1287343655845367808'
//               },
//             }
//           },
//           d1scord_effects_vault: {
//             title: 'VAULT',
//             subProducts: {
//               hoa_anh_dao: {
//                 title: 'Hoa Anh Đào',
//                 emoji: '1287346353906778132'
//               },
//               hoa_anh_dao_hong: {
//                 title: 'Hoa Anh Đào Hồng',
//                 emoji: '1287346347527241872'
//               },
//               hoa_anh_dao_ukon: {
//                 title: 'Hoa Anh Đào Ukon',
//                 emoji: '1287346357639708704'
//               },
//               hoa_anh_dao_gyoiko: {
//                 title: 'Hoa Anh Đào Gyoiko',
//                 emoji: '1287346369832550492'
//               },
//               ech_gian_du: {
//                 title: 'Ếch Giận Dữ',
//                 emoji: '1287346367647449119'
//               },
//               ech_ngoc_nghech: {
//                 title: 'Ếch Ngốc Nghếch',
//                 emoji: '1287346360705876051'
//               },
//               trung_op_la: {
//                 title: 'Trứng Ốp La',
//                 emoji: '1287346345518301244'
//               },
//               trung_chien_xanh_la: {
//                 title: 'Trứng Chiên Xanh Lá',
//                 emoji: '1287346349813141544'
//               },
//               ca_phe_sang: {
//                 title: 'Cà Phê Sáng',
//                 emoji: '1287346362832388212'
//               },
//               banh_my_nuong: {
//                 title: 'Bánh Mỳ Nướng',
//                 emoji: '1287346351784464404'
//               },
//               banh_my_chay: {
//                 title: 'Bánh Mỳ Cháy',
//                 emoji: '1287346355823448064'
//               },
//               stinkums: {
//                 title: 'Stinkums',
//                 emoji: '1287346371510276198'
//               },
//               stinkums_yeu_tinh: {
//                 title: 'Stinkums Yêu Tinh',
//                 emoji: '1287346365290250331'
//               },
//               bua_sang_D1scord: {
//                 title: 'Bữa Sáng D1scord',
//                 emoji: '1287349528525275197'
//               },
//               bua_sang_socola_D1scord: {
//                 title: 'Bữa Sáng Sô-cô-la D1scord',
//                 emoji: '1287349521076191234'
//               },
//               heartzilla: {
//                 title: 'Heartzilla',
//                 emoji: '1287349524062273648'
//               },
//               heartzilla_tim: {
//                 title: 'Heartzilla (Tím)',
//                 emoji: '1287349531557630044'
//               },
//             }
//           },
//           discord_effects_pojo: {
//             title: 'POJO',
//             subProducts: {
//               giap_mu_kabuto: {
//                 title: 'Giáp Mũ Kabuto',
//                 description: '69K',
//                 emoji: '1287351247057190932'
//               },
//               mat_na_oni: {
//                 title: 'Mặt Nạ Oni',
//                 emoji: '1287351249423044669'
//               },
//               mu_rom: {
//                 title: 'Mũ Rơm',
//                 emoji: '1287351238882496512'
//               },
//               net_muc_anh_dao: {
//                 title: 'Nét Mực Anh Đào',
//                 emoji: '1287351244196937821'
//               },
//               chien_binh_anh_dao: {
//                 title: 'Chiến Binh Anh Đào',
//                 emoji: '1287351241256730744'
//               },
//               vet_phi_tieu: {
//                 title: 'Vết Phi Tiêu',
//                 emoji: '1287351251088179224'
//               },
//               loi_nguyen_quy_oni: {
//                 title: 'Lời Nguyền Quỷ Oni',
//                 emoji: '1287351256167354490'
//               },
//               muc_va_kiem: {
//                 title: 'Mực và Kiếm',
//                 emoji: '1287351260219052105'
//               },
//               katana_anh_dao: {
//                 title: 'Katana Anh Đào',
//                 emoji: '1287351254347026554'
//               },
//             },
//           },
//           d1scord_effects_valorant: {
//             title: 'Valorant Champions',
//             subProducts:{
//                 valorant_champions_2024: {
//                     title: 'VALORANT Champions 2024',
//                     emoji: '1286688513047269448',
//                   },
//                   dich_chuyen_yoru: {
//                     title: 'Dịch Chuyển Chiều Không Gian - Yoru',
//                     emoji: '1286688079528198307',
//                   },
//                   may_hoa_chat_viper: {
//                     title: 'Mây Hóa Chất - Viper',
//                     emoji: '1286687619786215506',
//                   },
//                   truy_lung_ky_uc_cypher: {
//                     title: 'Truy Lùng Ký Ức - Cypher',
//                     emoji: '1286688077322125332',
//                   },
//                   chut_vi_clove: {
//                     title: 'Chút Vị Clove',
//                     emoji: '1286688075421974659',
//                   },
//                   diet_gon: {
//                     title: 'DIỆT GỌN',
//                     emoji: '1286687617391530137',
//                   },
//                   mu_trum_dau_cua_omen: {
//                     title: 'Mũ Trùm Đầu của Omen',
//                     emoji: '1286687647259164788',
//                   },
//                   anh_nhin_cua_reyna: {
//                     title: 'Ánh Nhìn của Reyna',
//                     emoji: '1286687636555038791',
//                   },
//                   bao_phi_tieu: {
//                     title: 'Bão Phi Tiêu',
//                     emoji: '1286687628795842561',
//                   },
//                   xe_rach_chieu_khong_gian_yoru: {
//                     title: 'Xé Rách Chiều Không Gian - Yoru',
//                     emoji: '1286687661607878656',
//                   },
//                   vct_sieu_tan_tinh: {
//                     title: 'VCT Siêu Tân Tinh',
//                     emoji: '1286687666145988628',
//                   },
//                   quet_sach: {
//                     title: 'QUÉT SẠCH',
//                     emoji: '1286687659573383259',
//                   },
//                   clove_muu_meo: {
//                     title: 'Clove Mưu Mẹo',
//                     emoji: '1286687653990895646',
//                   },
//                   clove_bat_tu: {
//                     title: 'Clove Bất Tử',
//                     emoji: '1286687656968851467',
//                   },
//             }
//           },
//           d1scord_effects_spongebob: {
//             title: 'SpongeBob',
//             subProducts: {
//               spongebob: {
//                 title: 'SpongeBob',
//                 emoji: '1287352380396011602'
//               },
//               tri_tuong_tuong: {
//                 title: 'Trí Tưởng Tượng',
//                 emoji: '1287352384124882955'
//               },
//               sao_bien_patrick: {
//                 title: 'Sao Biển Patrick',
//                 emoji: '1287352373672542218'
//               },
//               may_hoa: {
//                 title: 'Mây Hoa',
//                 emoji: '1287352493835157576'
//               },
//               oc_sen_gary: {
//                 title: 'Ốc Sên Gary',
//                 emoji: '1287352376319283294'
//               },
//               sandy_cheeks: {
//                 title: 'Sandy Cheeks',
//                 emoji: '1287352378135150716'
//               },
//               musclebob: {
//                 title: 'MuscleBob',
//                 emoji: '1287352382396567573'
//               },
//               ho_so_tuyet_voi: {
//                 title: 'Hồ Sơ Tuyệt Vời',
//                 emoji: '1287352504341762048'
//               },
//               squidward_dep_trai: {
//                 title: 'Squidward Đẹp Trai',
//                 emoji: '1287352501569327155'
//               },
//               doodlebob_tiep_quan: {
//                 title: 'DoodleBob Tiếp Quản',
//                 emoji: '1287352496628695072'
//               },
//               plankton_nat_bet: {
//                 title: 'Plankton Nát Bét',
//                 emoji: '1287352499249872928'
//               },
//               hoa_dai_duong: {
//                 title: 'Hoa Đại Dương',
//                 emoji: '1287352507600732191'
//               },
//             },
//           },
//           d1scord_effects_dark_fantasy: {
//             title: 'DARK FANTASY',
//             subProducts: {
//               phu_thuy_man_dem: {
//                 title: 'Phù Thủy Màn Đêm',
//                 emoji: '1287354360363483196'
//               },
//               vuong_mien_ky_di: {
//                 title: 'Vương Miện Kỳ Dị',
//                 emoji: '1287354364360527913'
//               },
//               luoi_dao_dia_phu: {
//                 title: 'Lưỡi Dao Địa Phù',
//                 emoji: '1287354370140409958'
//               },
//               dom_lua_linh_hon: {
//                 title: 'Đốm Lửa Linh Hồn',
//                 emoji: '1287354362087211018'
//               },
//               nhan_ky_quai: {
//                 title: 'Nhẫn Kỳ Quái',
//                 emoji: '1287354366327783494'
//               },
//               dau_an_than_bi: {
//                 title: 'Dấu Ấn Thần Bí',
//                 emoji: '1287354368277872650'
//               },
//               trieu_hoi_than_bi: {
//                 title: 'Triệu Hồi Thần Bí',
//                 emoji: '1287354655717851248'
//               },
//               han_thu: {
//                 title: 'Hận Thù',
//                 emoji: '1287354662642782229'
//               },
//               hoa_linh: {
//                 title: 'Hỏa Linh',
//                 emoji: '1287354658775629855'
//               },
//             },
//           },
//           d1scord_effects_palword: {
//             title: 'PALWORD',
//             subProducts: {
//               chillet: {
//                 title: 'Chillet',
//                 emoji: '1287356279911612417'
//               },
//               khoi_cau_pal: {
//                 title: 'Khối Cầu Pal',
//                 emoji: '1287356282415743037'
//               },
//               cattiva: {
//                 title: 'Cattiva',
//                 emoji: '1287356290234060831'
//               },
//               lamball: {
//                 title: 'Lamball',
//                 emoji: '1287356284521152562'
//               },
//               depresso: {
//                 title: 'Depresso',
//                 emoji: '1287356288631705640'
//               },
//               selyne: {
//                 title: 'Selyne',
//                 emoji: '1287356286463115274'
//               },
//               saya: {
//                 title: 'Saya',
//                 emoji: '1287356296378712116'
//               },
//               thuc_day: {
//                 title: 'Thức Dậy!',
//                 emoji: '1287356292448391210'
//               },
//               tocotoco: {
//                 title: 'Tocotoco',
//                 emoji: '1287356299964715059'
//               }
//             }
//           },
//           d1scord_effects_galaxy: {
//             title: 'GALAXY',
//             subProducts: {
//               bui_sao: {
//                 title: 'Bụi Sao',
//                 emoji: '1287357615990374431'
//               },
//               ho_den: {
//                 title: 'Hố Đen',
//                 emoji: '1287357606515441695'
//               },
//               chom_sao: {
//                 title: 'Chòm Sao',
//                 emoji: '1287357613234847804'
//               },
//               he_mat_troi: {
//                 title: 'Hệ Mặt Trời',
//                 emoji: '1287357610370007180'
//               },
//               ufo: {
//                 title: 'UFO',
//                 emoji: '1287357608491225149'
//               },
//               mu_phi_hanh_gia: {
//                 title: 'Mũ Phi Hành Gia',
//                 emoji: '1287357618880381010'
//               },
//               sao_bang: {
//                 title: 'Sao Băng',
//                 emoji: '1287357629881913364'
//               },
//               sieu_tan_tinh: {
//                 title: 'Siêu Tân Tinh',
//                 emoji: '1287414027773022208'
//               },
//               hoang_hon: {
//                 title: 'Hoàng Hôn',
//                 emoji: '1287414027773022208'
//               }
//             }
//           },
//           d1scord_effects_anime: {
//             title: 'ANIME',
//             subProducts: {
//               tai_meo: {
//                 title: 'Tai Mèo',
//                 emoji: '1287418932273086464'
//               },
//               khi_luc: {
//                 title: 'Khí Lực',
//                 emoji: '1287419272611496056'
//               },
//               trai_tim_ron_rang: {
//                 title: 'Trái Tim Rộn Ràng',
//                 emoji: '1287418915936403538'
//               },
//               sung_so: {
//                 title: 'Sững Sờ',
//                 emoji: '1287420857110757460'
//               },
//               cuong_no: {
//                 title: 'Cuồng Nộ',
//                 emoji: '1287418925256146946'
//               },
//               mit_uot: {
//                 title: 'Mít Ướt',
//                 emoji: '1287418918310248620'
//               },
//               toa_nang_luong: {
//                 title: 'Tỏa Năng Lượng',
//                 emoji: '1287420252937781258'
//               },
//               hon_lia_khoi_xac: {
//                 title: 'Hồn Lìa Khỏi Xác',
//                 emoji: '1287418930360615015'
//               },
//               do_mo_hoi: {
//                 title: 'Đổ Mồ Hôi',
//                 emoji: '1287418922647293993'
//               },
//               mat_long_lanh: {
//                 title: 'Mắt Long Lanh',
//                 emoji: '1287418939621773333'
//               },
//               dang_yeu: {
//                 title: 'Đáng Yêu',
//                 emoji: '1287418920482902136'
//               },
//               bang_hoang: {
//                 title: 'Bàng Hoàng',
//                 emoji: '1287418928070529088'
//               },
//               gian_du: {
//                 title: 'Giận Dữ',
//                 emoji: '1287418913809764353'
//               },
//               mong_mo: {
//                 title: 'Mộng Mơ',
//                 emoji: '1287419285253394593'
//               },
//               vu_no_khi_luc: {
//                 title: 'Vụ Nổ Khí Lực',
//                 emoji: '1287419280836661331'
//               },
//               sushi_dai_chien: {
//                 title: 'Sushi Đại Chiến',
//                 emoji: '1287419277158383656'
//               },
//               trai_tim_phep_thuat: {
//                 title: 'Trái Tim Phép Thuật',
//                 emoji: '1287419287270723727'
//               },
//               vun_vo: {
//                 title: 'Vụn Vỡ',
//                 emoji: '1287419289745231924'
//               },
//               nem_phi_tieu: {
//                 title: 'Ném Phi Tiêu',
//                 emoji: '1287419291888652399'
//               },
//               bung_no_suc_manh: {
//                 title: 'Bùng Nổ Sức Mạnh',
//                 emoji: '1287419295290101823'
//               }
//             }
//           },  
//           d1scord_effects_lofi_vibes: {
//             title: 'LOFI VIBES',
//             subProducts: {
//               song_da_sac: {
//                 title: 'Sóng Đa Sắc',
//                 emoji: '1287422827456237639'
//               },
//               chu_meo_am_ap: {
//                 title: 'Chú Mèo Ấm Áp',
//                 emoji: '1287422829633077381'
//               },
//               oc_dao: {
//                 title: 'Ốc Đảo',
//                 emoji: '1287422838797500497'
//               },
//               tam_trang_ngay_mua: {
//                 title: 'Tâm Trạng Ngày Mưa',
//                 emoji: '1287422836209614878'
//               },
//               tai_nghe_am_cung: {
//                 title: 'Tai Nghe Ấm Cúng',
//                 emoji: '1287422834053877895'
//               },
//               ve_ngau_hung: {
//                 title: 'Vé Ngẫu Hứng',
//                 emoji: '1287422831885418568'
//               },
//               goc_hoc_tap: {
//                 title: 'Góc Học Tập',
//                 emoji: '1287422843256180850'
//               },
//               thuc_trang_dem: {
//                 title: 'Thức Trắng Đêm',
//                 emoji: '1287422846112497750'
//               },
//               mau_nuoc: {
//                 title: 'Màu Nước',
//                 emoji: '1287424022174371981'
//               }
//             }
//           },   
//           d1scord_effects_fantasy: {
//             title: 'FANTASY',
//             subProducts: {
//               goi_tien_tieu_yeu: {
//                 title: 'Gói Tiên & Tiểu Yêu',
//                 emoji: '1286688513047269448'
//               },
//               hoa_kiem: {
//                 title: 'Hỏa Kiếm',
//                 emoji: '1286688079528198307'
//               },
//               thuoc_phep_ma_thuat: {
//                 title: 'Thuốc Phép Ma Thuật',
//                 emoji: '1286687619786215506'
//               },
//               tinh_linh_tien_toc: {
//                 title: 'Tinh Linh Tiên Tộc',
//                 emoji: '1286688077322125332'
//               },
//               quyen_truong_phap_su: {
//                 title: 'Quyền Trượng Pháp Sư',
//                 emoji: '1286688075421974659'
//               },
//               co_tu_phat_sang: {
//                 title: 'Cỏ Tự Phát Sáng',
//                 emoji: '1286687617391530137'
//               },
//               khien_phong_thu: {
//                 title: 'Khiên Phòng Thủ',
//                 emoji: '1286687647259164788'
//               },
//               huy_hieu_dau_lau: {
//                 title: 'Huy Hiệu Đấu Lâu',
//                 emoji: '1286687636555038791'
//               },
//               kho_bau_va_chia_khoa: {
//                 title: 'Kho Báu và Chìa Khóa',
//                 emoji: '1286687628795842561'
//               },
//               ban_nuoc: {
//                 title: 'Bản Nước',
//                 emoji: '1286687661607878656'
//               },
//               giac_mo_hoa_anh_dao: {
//                 title: 'Giấc Mơ Hoa Anh Đào',
//                 emoji: '1286687666145988628'
//               },
//               day_leo_bi_an: {
//                 title: 'Dây Leo Bí Ẩn',
//                 emoji: '1286687666145988628'
//               },
//               bui_lap_lanh: {
//                 title: 'Bụi Lấp Lánh',
//                 emoji: '1286687636555038791'
//               }
//             }
//           },      
//           d1scord_effects_cyberpunk: {
//             title: 'CYBERPUNK',
//             subProducts: {
//               goi_toi_bi_hack_a: {
//                 title: 'Gói Tôi Bị Hack À?',
//                 emoji: '1286688513047269448'
//               },
//               truc_trac: {
//                 title: 'Trục Trặc',
//                 emoji: '1286688079528198307'
//               },
//               cybernetic: {
//                 title: 'Cybernetic',
//                 emoji: '1286687619786215506'
//               },
//               binh_minh_ky_thuat_so: {
//                 title: 'Bình Minh Kỹ Thuật Số',
//                 emoji: '1286688077322125332'
//               },
//               cay_ghep: {
//                 title: 'Cấy Ghép',
//                 emoji: '1286688075421974659'
//               },
//               co_may_vuot_man_dem: {
//                 title: 'Cỗ Máy Vượt Màn Đêm',
//                 emoji: '1286687617391530137'
//               },
//               loi_lien_ket_nguoc: {
//                 title: 'Lỗi Liên Kết Ngược',
//                 emoji: '1286687647259164788'
//               }
//             }
//           },
//           d1scord_effects_elements: {
//             title: 'Elements',
//             subProducts: {
//               goi_nguyen_to: {
//                 title: 'Gói Nguyên Tố',
//                 emoji: '1286688513047269448'
//               },
//               lua: {
//                 title: 'Lửa',
//                 emoji: '1286688079528198307'
//               },
//               nuoc: {
//                 title: 'Nước',
//                 emoji: '1286687619786215506'
//               },
//               gio: {
//                 title: 'Gió',
//                 emoji: '1286688077322125332'
//               },
//               dat: {
//                 title: 'Đất',
//                 emoji: '1286688075421974659'
//               },
//               sam_set: {
//                 title: 'Sấm Sét',
//                 emoji: '1286687617391530137'
//               },
//               can_bang: {
//                 title: 'Cân Bằng',
//                 emoji: '1286687647259164788'
//               },
//               truot_da: {
//                 title: 'Trượt Đá',
//                 emoji: '1286687636555038791'
//               },
//               loc_xoay: {
//                 title: 'Lốc Xoáy',
//                 emoji: '1286687628795842561'
//               },
//               tinh_thong: {
//                 title: 'Tinh Thông',
//                 emoji: '1286687661607878656'
//               }
//             }
//           },
//           d1scord_effects_pirates: {
//             title: 'PIRATES',
//             subProducts: {
//               goi_thuyen_truong_cuop_bien: {
//                 title: 'Gói Thuyền Trưởng Cướp Biển',
//                 emoji: '1286688513047269448'
//               },
//               thuyen_truong_hai_tac: {
//                 title: 'Thuyền Trưởng Hải Tặc',
//                 emoji: '1286688079528198307'
//               },
//               be_lu_vo_lai: {
//                 title: 'Bè Lũ Vô Lại',
//                 emoji: '1286687619786215506'
//               },
//               vet_hat_tieu: {
//                 title: 'Vẹt Hạt Tiêu',
//                 emoji: '1286688077322125332'
//               },
//               xuong_cheo: {
//                 title: 'Xương Chéo',
//                 emoji: '1286688075421974659'
//               },
//               hoa_luc_dai_bac: {
//                 title: 'Hỏa Lực Đại Bác',
//                 emoji: '1286687617391530137'
//               },
//               nguoi_lai_tau: {
//                 title: 'Người Lái Tàu',
//                 emoji: '1286687647259164788'
//               },
//               roger_tuoi_vui: {
//                 title: 'Roger Tươi Vui',
//                 emoji: '1286687636555038791'
//               },
//               kho_bau_bi_lang_quen: {
//                 title: 'Kho Báu Bị Lãng Quên',
//                 emoji: '1286687628795842561'
//               },
//               con_tau_ma: {
//                 title: 'Con Tàu Ma',
//                 emoji: '1286687661607878656'
//               }
//             }
//           },
//           d1scord_effects_arcade: {
//             title: 'ARCADE',
//             subProducts: {
//               goi_nha_suu_tam_sao: {
//                 title: 'Gói Nhà Sưu Tầm Sao',
//                 emoji: '1286688513047269448'
//               },
//               tay_cam_dieu_khien: {
//                 title: 'Tay Cầm Điều Khiển',
//                 emoji: '1286688079528198307'
//               },
//               clyde_ke_xam_luoc: {
//                 title: 'Clyde Kẻ Xâm Lược',
//                 emoji: '1286687619786215506'
//               },
//               duong_ong_ao_mong: {
//                 title: 'Đường Ống Áo Mộng',
//                 emoji: '1286688077322125332'
//               },
//               chuyen_gia_nem_ro: {
//                 title: 'Chuyên Gia Ném Rổ',
//                 emoji: '1286688075421974659'
//               },
//               mallow_nhay_nhot: {
//                 title: 'Mallow Nhảy Nhót',
//                 emoji: '1286687617391530137'
//               },
//               ran_san_moi: {
//                 title: 'Rắn Săn Mồi',
//                 emoji: '1286687647259164788'
//               },
//               space_evader: {
//                 title: 'Space Evader',
//                 emoji: '1286687636555038791'
//               },
//               turbo_drive: {
//                 title: 'Turbo Drive',
//                 emoji: '1286687628795842561'
//               },
//               twinkle_trails: {
//                 title: 'Twinkle Trails',
//                 emoji: '1286687661607878656'
//               }
//             }
//           },
//           d1scord_effects_springtoons: {
//             title: 'SPRINGTOONS',
//             subProducts: {
//               goi_giai_dieu_mua_xuan: {
//                 title: 'Gói Giai Điệu Mùa Xuân',
//                 emoji: '1286688513047269448'
//               },
//               ong_mat_no_ro: {
//                 title: 'Ong Mật Nở Rộ',
//                 emoji: '1286688079528198307'
//               },
//               cap_doi_bo_cong_anh: {
//                 title: 'Cặp Đôi Bồ Công Anh',
//                 emoji: '1286687619786215506'
//               },
//               cau_vong_da_sac: {
//                 title: 'Cầu Vồng Đa Sắc',
//                 emoji: '1286688077322125332'
//               },
//               bui_dau_tay: {
//                 title: 'Bụi Dâu Tây',
//                 emoji: '1286688075421974659'
//               },
//               buom_luon: {
//                 title: 'Bướm Lượn',
//                 emoji: '1286687617391530137'
//               },
//               ca_vuon_hoa: {
//                 title: 'Cả Vườn Hoa',
//                 emoji: '1286687647259164788'
//               },
//               vu_dieu_canh_hoa: {
//                 title: 'Vũ Điệu Cánh Hoa',
//                 emoji: '1286687636555038791'
//               },
//               ban_dong_hanh_mua_xuan: {
//                 title: 'Bạn Đồng Hành Mùa Xuân',
//                 emoji: '1286687628795842561'
//               },
//               xuan_no_ro: {
//                 title: 'Xuân Nở Rộ',
//                 emoji: '1286687661607878656'
//               }
//             }
//           },
//           d1scord_effects_feelin_retro: {
//             title: 'FEELIN RETRO',
//             subProducts: {
//               goi_cam_xuc_trong_toi: {
//                 title: 'Gói Cảm Xúc Trong Tôi',
//                 emoji: '1286688513047269448'
//               },
//               cam_thay_tuyet_voi: {
//                 title: 'Cảm Thấy Tuyệt Vời',
//                 emoji: '1286688079528198307'
//               },
//               cam_thay_hoang_loan: {
//                 title: 'Cảm Thấy Hoảng Loạn',
//                 emoji: '1286687619786215506'
//               },
//               cam_thay_lo_lang: {
//                 title: 'Cảm Thấy Lo Lắng',
//                 emoji: '1286688077322125332'
//               },
//               cam_thay_khoai_chi: {
//                 title: 'Cảm Thấy Khoái Chí',
//                 emoji: '1286688075421974659'
//               },
//               cam_thay_tinh_nghich: {
//                 title: 'Cảm Thấy Tinh Nghịch',
//                 emoji: '1286687617391530137'
//               },
//               feelin_90s: {
//                 title: 'Feelin\' 90s',
//                 emoji: '1286687647259164788'
//               },
//               cam_thay_pizzazz: {
//                 title: 'Cảm Thấy Pizzazz',
//                 emoji: '1286687636555038791'
//               }
//             }
//           },                                                         
//         },
//       },
//   },
// },
};

module.exports = productInfo;
