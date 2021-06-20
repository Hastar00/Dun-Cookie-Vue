import {BaseProcessor} from "./BaseProcessor";

/**
 * 制作组通讯(游戏内公告)处理器。
 * <p>
 * TODO 该类需要改名为InGameAnnouncementProcessor 游戏内公告处理器
 */
export class DevNewsProcessor extends BaseProcessor {
  process(opt, kazeLocalData, kazeFun) {
    let list = [];
    let data = JSON.parse(opt.responseText);
    data.announceList.forEach(x => {
      if (x.announceId != 94 && x.announceId != 98 && x.announceId != 192 && x.announceId != 95 && x.announceId != 97) {
        let time = `${new Date().getFullYear()}/${x.month}/${x.day} ${kazeLocalData.setting.isTop ? '23:59:59' : '00:00:00'}`;
        list.push({
          time: Math.floor(new Date(time).getTime() / 1000),
          judgment: x.announceId,
          id: x.announceId,
          dynamicInfo: x.title,
          source: opt.source,
          url: x.webUrl,
        });
      }
    });
    if (kazeLocalData.setting.isPush == true) {
      kazeFun.JudgmentNewFocusAnnounceId(data);
    }
    return list.sort((x, y) => y.judgment - x.judgment);
  }
}
