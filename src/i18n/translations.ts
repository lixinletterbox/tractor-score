export type Language = 'en' | 'zh';

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Setup
    'setup.title': 'Tractor Score',
    'setup.subtitle': 'Start a new game for 4 to 10 players.',
    'setup.addPlayerLabel': 'Add Player Name',
    'setup.placeholder': 'Enter name (e.g. Alice)',
    'setup.addBtn': 'Add',
    'setup.noPlayers': 'No players added yet. Add at least 4 to begin.',
    'setup.playersReady': '{count} players ready',
    'setup.playersCount': '{count}/10 players added. Need at least 4.',
    'setup.startGame': 'Start Game',
    'setup.maxPlayers': 'Maximum 10 players allowed!',
    'setup.playerExists': 'Player already exists!',

    // Dashboard header
    'dashboard.title': 'Tractor Score',
    'dashboard.addPlayer': '+ Add Player',
    'dashboard.endGame': 'End Game',
    'dashboard.startNewGame': 'Start New Game',
    'dashboard.exportPdf': '📥 Export PDF',

    // Standings table
    'standings.title': 'Current Standings',
    'standings.clickForOptions': 'Click for options',
    'standings.clickToSetRoles': 'Click to set roles',

    // Record round
    'round.title': 'Record Round Result',
    'round.declarer': 'Declarer:',
    'round.selectDeclarer': "Click a player's latest score in the table above",
    'round.teamMax': 'Team (Max {count}):',
    'round.noneSelected': 'None selected',
    'round.calledCards': 'Cards Called by Declarer (optional)',
    'round.calledCardsPlaceholder': 'e.g. Ace of Spades, King of Hearts',
    'round.whoWon': 'Who won the round?',
    'round.optionDeclarer': 'Declarer',
    'round.optionOffense': 'Offense',
    'round.optionSurrender': 'Surrender',
    'round.levelsWonBy': 'Levels Won by {winner}',
    'round.level0': '0 Levels (Change Declarer only)',
    'round.level1': '1 Level',
    'round.level2': '2 Levels',
    'round.level3': '3 Levels',
    'round.levelsHelp': 'Select how many levels to advance.',
    'round.penalty': 'Penalty for Declarer Team (Lost on {score})',
    'round.penaltyNone': 'No Penalty (Stay on {score})',
    'round.penaltyBackTo2': 'Drop to base 2',
    'round.penaltyMinus2': 'Decrease by 2 levels',
    'round.penaltyMinus4': 'Decrease by 4 levels',
    'round.penaltyHelp': 'Special penalty rule for losing on J or A.',
    'round.submit': 'Record & Update Scores',
    'round.alertNoDeclarer': 'Please select a declarer',

    // Edit modal
    'edit.title': 'Edit Score for',
    'edit.label': 'New Level (e.g. 2, 8, J, A, 3*)',
    'edit.cancel': 'Cancel',
    'edit.save': 'Save',
    'edit.invalidScore': 'Invalid score format!',

    // Add player modal (dashboard)
    'addPlayer.title': 'Add Player',
    'addPlayer.label': 'Player Name',
    'addPlayer.placeholder': 'Enter name',
    'addPlayer.cancel': 'Cancel',
    'addPlayer.add': 'Add',
    'addPlayer.maxPlayers': 'Maximum 20 players allowed!',
    'addPlayer.exists': 'Player already exists!',

    // Dropdown menu
    'menu.editScore': '✎ Edit Score',
    'menu.resume': '▶ Resume',
    'menu.suspend': '⏸ Suspend',
    'menu.quit': '👋 Quit',
    'menu.moveLeft': 'Move Left',
    'menu.moveRight': 'Move Right',

    // End game modal
    'endGame.title': 'End Game',
    'endGame.confirm': 'Are you sure you want to end this game? The dashboard will be locked and no further rounds can be recorded.',
    'endGame.cancel': 'Cancel',
    'endGame.confirmBtn': 'Confirm',

    // PDF
    'pdf.title': 'Tractor Card Game Tracker - Results',
    'pdf.generated': 'Generated on:',
    'pdf.start': 'Start',
    'pdf.game': 'Game',
  },
  zh: {
    // 设置
    'setup.title': '拖拉机记分',
    'setup.subtitle': '开始一局新游戏，4到10位玩家。',
    'setup.addPlayerLabel': '添加玩家名称',
    'setup.placeholder': '输入名字（例如：小明）',
    'setup.addBtn': '添加',
    'setup.noPlayers': '还没有添加玩家。至少需要4位才能开始。',
    'setup.playersReady': '{count} 位玩家已就绪',
    'setup.playersCount': '已添加 {count}/10 位玩家。至少需要4位。',
    'setup.startGame': '开始游戏',
    'setup.maxPlayers': '最多只能有10位玩家！',
    'setup.playerExists': '该玩家已存在！',

    // 仪表盘头部
    'dashboard.title': '拖拉机记分',
    'dashboard.addPlayer': '+ 添加玩家',
    'dashboard.endGame': '结束游戏',
    'dashboard.startNewGame': '开始新游戏',
    'dashboard.exportPdf': '📥 导出PDF',

    // 排名表
    'standings.title': '当前排名',
    'standings.clickForOptions': '点击查看选项',
    'standings.clickToSetRoles': '点击设置角色',

    // 记录回合
    'round.title': '记录回合结果',
    'round.declarer': '庄家：',
    'round.selectDeclarer': '点击玩家的最新分数',
    'round.teamMax': '队友（最多 {count} 人）：',
    'round.noneSelected': '未选择',
    'round.calledCards': '庄家叫的牌（可选）',
    'round.calledCardsPlaceholder': '例如：黑桃A、红心K',
    'round.whoWon': '谁赢了这一回合？',
    'round.optionDeclarer': '庄家',
    'round.optionOffense': '攻方',
    'round.optionSurrender': '投降',
    'round.levelsWonBy': '{winner}赢了几级',
    'round.level0': '0 级（仅更换庄家）',
    'round.level1': '1 级',
    'round.level2': '2 级',
    'round.level3': '3 级',
    'round.levelsHelp': '选择升几级。',
    'round.penalty': '庄家队伍的惩罚（在 {score} 失败）',
    'round.penaltyNone': '无惩罚（保持在 {score}）',
    'round.penaltyBackTo2': '降回基础2',
    'round.penaltyMinus2': '降2级',
    'round.penaltyMinus4': '降4级',
    'round.penaltyHelp': '在J或A失败的特殊惩罚规则。',
    'round.submit': '记录并更新分数',
    'round.alertNoDeclarer': '请选择一位庄家',

    // 编辑对话框
    'edit.title': '编辑分数 -',
    'edit.label': '新等级（例如 2、8、J、A、3*）',
    'edit.cancel': '取消',
    'edit.save': '保存',
    'edit.invalidScore': '分数格式无效！',

    // 添加玩家对话框（仪表盘）
    'addPlayer.title': '添加玩家',
    'addPlayer.label': '玩家名称',
    'addPlayer.placeholder': '输入名字',
    'addPlayer.cancel': '取消',
    'addPlayer.add': '添加',
    'addPlayer.maxPlayers': '最多只能有20位玩家！',
    'addPlayer.exists': '该玩家已存在！',

    // 下拉菜单
    'menu.editScore': '✎ 编辑分数',
    'menu.resume': '▶ 恢复',
    'menu.suspend': '⏸ 暂停',
    'menu.quit': '👋 退出',
    'menu.moveLeft': '左移',
    'menu.moveRight': '右移',

    // 结束游戏对话框
    'endGame.title': '结束游戏',
    'endGame.confirm': '确定要结束游戏吗？计分表将被锁定，无法再记录新的回合。',
    'endGame.cancel': '取消',
    'endGame.confirmBtn': '确认',

    // PDF
    'pdf.title': '拖拉机扑克牌记分表 - 结果',
    'pdf.generated': '生成时间：',
    'pdf.start': '开始',
    'pdf.game': '回合',
  }
};

export default translations;
