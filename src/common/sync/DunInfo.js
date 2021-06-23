import BrowserUtil from '../BrowserUtil';
import {MESSAGE_DUN_INFO_GET, MESSAGE_DUN_INFO_UPDATE} from '../Constants';
import {deepAssign} from '../TmpUtil';

/**
 * 蹲饼数据
 * <p>
 * 插件停止后该数据会丢失(目前看来不需要持久化)
 */
class DunInfo {
  // 蹲饼次数
  counter = 0;
  // 最后一次蹲饼时间
  lastDunTime = -1;

  constructor() {
    BrowserUtil.sendMessage(MESSAGE_DUN_INFO_GET).then(data => deepAssign(this, data));
    BrowserUtil.addMessageListener('dunInfo', MESSAGE_DUN_INFO_UPDATE, data => deepAssign(this, data));
  }

  saveUpdate() {
    BrowserUtil.sendMessage(MESSAGE_DUN_INFO_UPDATE, this);
  }
}

const instance = new DunInfo();
export default instance;
