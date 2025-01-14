import {DataSource} from '../DataSource';
import Settings from '../../Settings';
import NotificationUtil from '../../util/NotificationUtil';
import TimeUtil from '../../util/TimeUtil';
import {DataItem} from '../../DataItem';
import HttpUtil from "../../util/HttpUtil";

/**
 * 需要被忽略的公告列表，一般是常驻活动/用户协议公告之类的
 * <p>
 * <strong>注意：这里只设置了IOS公告的值，Android的值是不同的，如果以后要获取Android的公告需要把那边的忽略列表也加上去</strong>
 */
const ignoreAnnounces = [94, 95, 97, 98, 192];

/**
 * 游戏内公告数据源。
 * <p>
 * 虽然在插件的提示中是制作组通讯，但实际上能捕获所有游戏内公告，考虑加正则？
 */
export class InGameAnnouncementDataSource extends DataSource {

  static get typeName() {
    return 'arknights_in_game_announcement';
  };

  FocusAnnounceId = null;
  ClientVersion = null;
  ResVersion = null;

  constructor(icon, dataName, title, dataUrl, priority) {
    super(icon, dataName, title, dataUrl, priority);
  }

  async processData(rawDataText) {
    let list = [];
    let data = JSON.parse(rawDataText);
    data.announceList.forEach(x => {
      if (ignoreAnnounces.includes(parseInt(x.announceId))) {
        return;
      }
      const time = new Date(`${new Date().getFullYear()}-${x.month}-${x.day} ${Settings.getTimeBySortMode()}`);
      list.push(DataItem.builder(this.dataName)
        .id(x.announceId)
        .timeForSort(time.getTime())
        .timeForDisplay(TimeUtil.format(time, 'yyyy-MM-dd'))
        .content(x.title)
        .jumpUrl(x.webUrl)
        .build()
      );
    });
    if (Settings.dun.enableNotice) {
      this.JudgmentNewFocusAnnounceId(data);

      let versionData = await HttpUtil.GET_Json(`https://ak-conf.hypergryph.com/config/prod/official/${Settings.dun.gamePlatform}/version`);
      this.JudgmentVersionRelease(versionData);
    }
    
    return list;
  }

  // 通讯组专用 检测到了可能会更新
  JudgmentNewFocusAnnounceId(data) {
    if (data) {
      if (this.FocusAnnounceId && data.focusAnnounceId && this.FocusAnnounceId != data.focusAnnounceId && this.FocusAnnounceId < data.focusAnnounceId) {
        let announceIdExist = false;
        data.announceList.forEach(x => {
          if (data.focusAnnounceId == x.announceId) {
            announceIdExist = true;
          }
        })
        if (!announceIdExist) {
          NotificationUtil.SendNotice(`【通讯组预告】小刻貌似闻到了饼的味道！`, '检测到游戏出现公告弹窗，可能马上发饼！', null, new Date().getTime());
        }
      }
      this.FocusAnnounceId = data.focusAnnounceId;
    }
  }

  // 判断版本号时候更新
  JudgmentVersionRelease(versionData) {
    if (versionData) {
      if (this.ClientVersion && versionData.clientVersion && this.ClientVersion != versionData.clientVersion)
      {
        const nowVersion = versionData.clientVersion.split(".").map(a => parseInt(a));
        const pastVersion = this.ClientVersion.split(".").map(a => parseInt(a));
    
        if(nowVersion[0] > pastVersion[0]) {
          NotificationUtil.SendNotice(`【${Settings.dun.gamePlatform}/超大版本】更新包已经准备好啦`, '博士，这可是难遇的超大版本更新诶！！！\n相信博士已经等不及了吧，快去下载呦~', null, new Date().getTime());
        } else if (nowVersion[1] > pastVersion[1] || nowVersion[2] > pastVersion[2]) {
          NotificationUtil.SendNotice(`【${Settings.dun.gamePlatform}/大版本】更新包已经准备好啦`, '博士，更新包已经给你准备好啦！\n先下载更新包，等等进游戏快人一部噢！', null, new Date().getTime());
        } 
      } else if (this.ResVersion && versionData.resVersion && this.ResVersion != versionData.resVersion) {
        NotificationUtil.SendNotice(`【${Settings.dun.gamePlatform}/闪断更新】已经完成闪断更新`, '博士，快去重启进入游戏吧！', null, new Date().getTime());
      }
      this.ClientVersion = versionData.clientVersion;
      this.ResVersion = versionData.resVersion;
    }
  }
}
