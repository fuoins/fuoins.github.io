// ======================微信浏览器检测======================
function isWeChatBrowser() {
    return /MicroMessenger/i.test(navigator.userAgent);
}

function showWeChatTip() {
    // 动态注入提示样式
    const style = document.createElement('style');
    style.textContent = `
        .wechat-tip-mask {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.88);
            z-index: 999999;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px 24px;
            box-sizing: border-box;
            color: #ffffff;
            text-align: center;
        }
        .wechat-tip-mask .tip-icon {
            font-size: 64px;
            margin-bottom: 20px;
        }
        .wechat-tip-mask .tip-title {
            font-size: 22px;
            font-weight: 600;
            margin-bottom: 16px;
        }
        .wechat-tip-mask .tip-desc {
            font-size: 15px;
            line-height: 1.7;
            color: #cccccc;
            max-width: 320px;
        }
        .wechat-tip-mask .tip-guide {
            margin-top: 28px;
            padding: 12px 20px;
            background: rgba(255, 215, 0, 0.15);
            border: 1px solid rgba(255, 215, 0, 0.4);
            border-radius: 8px;
            font-size: 14px;
            color: #ffd700;
            line-height: 1.6;
        }
    `;
    document.head.appendChild(style);

    // 创建提示遮罩
    const mask = document.createElement('div');
    mask.className = 'wechat-tip-mask';
    mask.innerHTML = `
        <div class="tip-icon">⚠️</div>
        <div class="tip-title">请在浏览器中打开使用</div>
        <div class="tip-desc">
            当前在微信内置浏览器中打开，无法正常使用题库答题、解锁等全部功能
        </div>
        <div class="tip-guide">
            操作方式：<br>
            点击右上角「···」按钮 → 选择「在浏览器打开」
        </div>
    `;
    document.body.appendChild(mask);
}

function showNotification(type) {
    const existingNotif = document.querySelector('.notification');
    if (existingNotif) existingNotif.remove();

    const notif = document.createElement('div');
    notif.className = `notification ${type}`;

    if (type === 'unlock') {
        notif.innerHTML = `
            <div class="notif-header">
                <span class="notif-icon">🎉</span>
                <span class="notif-title">解锁成功！</span>
            </div>
            <div class="notif-body">
                所有题库和顺序模式已解锁<br>
                无需答题即可使用全部功能<br>
                错题集功能已经解锁
                <hr style="margin:16px 0;border-color:rgba(255,255,255,0.2)">
                <div style="font-size:14px;">
                📢 系统更新公告⚠️<br>
✅ 所有题库更新完毕，带图题目已上传完成<br>
🔧 修复优化内容：<br>
• 修复前端绕过解锁限制bug<br>
• 题库对接后端数据处理<br>
• 新增防爬虫Token校验<br>
• 后端答案隐藏防护升级<br>
• 修复图片后端拦截导致无法放行<br>
                </div>
            </div>
            <button class="notif-btn" onclick="this.closest('.notification').remove()">确定</button>
        `;
    } else {
        notif.innerHTML = `
            <div class="notif-header">
                <span class="notif-icon">🔒</span>
                <span class="notif-title">尚未解锁</span>
            </div>
            <div class="notif-body">
                顺序模式和全部题库❌未解锁<br>
                错题集功能未解锁<br>
                需要完成❗赵宇真爱粉测试❗并获得💯满分<br>
                或者把[查看本机解锁ID]并发给管理员加入白名单解锁
                <hr style="margin:16px 0;border-color:rgba(255,255,255,0.2)">
                <div style="font-size:14px;">
                📢 系统更新公告⚠️<br>
✅ 所有题库更新完毕，带图题目已上传完成<br>
🔧 修复优化内容：<br>
• 修复前端绕过解锁限制bug<br>
• 题库对接后端数据处理<br>
• 新增防爬虫Token校验<br>
• 后端答案隐藏防护升级<br>
• 修复图片后端拦截导致无法放行<br>
                </div>
            </div>
            <button class="notif-btn" onclick="this.closest('.notification').remove()">知道了</button>
        `;
    }

    document.body.appendChild(notif);
    // 已移除自动消失定时器，仅点击按钮关闭
}



        // 防复制、禁用全选
        document.addEventListener('contextmenu', e => e.preventDefault());
        document.addEventListener('copy', e => e.preventDefault());
        document.addEventListener('cut', e => e.preventDefault());
        document.addEventListener('keydown', e => {
            if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
                e.preventDefault();
            }
        });

        // ======================全局变量区======================
        let examStartTime = 0;
        let isZYBuiltExam = false; // 是否是Worker内置的赵宇题库
        let examToken = ''; // 题库访问Token

        // 行为数据收集（用于人机验证）
        let behaviorData = {
            totalClicks: 0,
            questionThinkTimes: [],
            lastQuestionTime: 0,
            answerChanges: 0
        };

        let currentExamData = null;
        let isRandomMode = true;
        let currentExamFile = '';
        let errorCounts = {};
        let isZhaoYuUnlocked = false;
        let zhaoYuPerfectScoreAchieved = false;

        const ERROR_STORAGE_PREFIX = 'test_error_counts_';
        const USER_ID_KEY = 'local_unique_user_id';
        let userLocalId = '';

        // ======================用户ID相关函数======================
        function generateUserId() {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let id = '';
            for(let i = 0; i < 16; i++){
                id += chars[Math.floor(Math.random() * chars.length)];
            }
            return id;
        }

        function initLocalUserId(){
            let stored = localStorage.getItem(USER_ID_KEY);
            if(!stored){
                stored = generateUserId();
                localStorage.setItem(USER_ID_KEY, stored);
            }
            userLocalId = stored;
        }

        function bindShowIdButton(){
            const idBtn = document.getElementById('showMyIdBtn');
            if(idBtn){
                idBtn.addEventListener('click',()=>{
                    alert(`你的本机专属解锁ID：\n${userLocalId}\n发送给管理员加入白名单可直接解锁全部题库`);
                })
            }
        }

        // ======================获取题库访问Token======================
        async function getExamToken() {
            try {
                const res = await fetch(`/api/get-exam-token?userId=${encodeURIComponent(userLocalId)}`);
                const data = await res.json();
                if (data.code === 200 && data.token) {
                    examToken = data.token;
                    return true;
                }
                return false;
            } catch (e) {
                console.log("获取Token失败", e);
                return false;
            }
        }

        // ======================单题答案验证（服务端）======================
        async function checkSingleAnswer(questionId, questionType, userAnswer) {
            try {
                const res = await fetch('/api/check-single-answer', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: userLocalId,
                        questionId,
                        questionType,
                        userAnswer
                    })
                });
                const data = await res.json();
                if (data.code === 200) {
                    return data.isCorrect;
                }
                return null;
            } catch (e) {
                console.log("单题验证失败", e);
                return null;
            }
        }

        // ======================重置行为数据======================
        function resetBehaviorData() {
            behaviorData = {
                totalClicks: 0,
                questionThinkTimes: [],
                lastQuestionTime: Date.now(),
                answerChanges: 0
            };
        }

        // ======================记录点击行为======================
        function recordClick() {
            behaviorData.totalClicks++;
        }

        // ======================服务端解锁校验======================
        async function checkUnlockFromServer(){
            try{
                const res = await fetch(`/api/check-unlock?userId=${encodeURIComponent(userLocalId)}`);
                const data = await res.json();
                if(data.isUnlocked){
                    isZhaoYuUnlocked = true;
                    unlockOtherExams();
                    enableOrderMode();
                }else{
                    isZhaoYuUnlocked = false;
                    lockOtherExams();
                    disableOrderMode();
                }
            }catch(e){
                console.log("解锁状态查询失败",e);
                isZhaoYuUnlocked = false;
                lockOtherExams();
                disableOrderMode();
            }
        }

        // ======================题库解锁UI控制======================
        function unlockOtherExams() {
            const selector = document.getElementById('examSelector');
            for (let i = 0; i < selector.options.length; i++) {
                if (selector.options[i].value && selector.options[i].value !== 'ceshi/data/zy.json') {
                    selector.options[i].disabled = false;
                    selector.options[i].text = selector.options[i].text.replace(' (需解锁)', '');
                }
            }
        }

        function lockOtherExams() {
            const selector = document.getElementById('examSelector');
            for (let i = 0; i < selector.options.length; i++) {
                if (selector.options[i].value && selector.options[i].value !== 'ceshi/data/zy.json') {
                    selector.options[i].disabled = true;
                    if (!selector.options[i].text.includes('(需解锁)')) {
                        selector.options[i].text += ' (需解锁)';
                    }
                }
            }
        }

        function enableOrderMode() {
            document.getElementById('orderMode').classList.remove('locked');
            document.getElementById('orderMode').disabled = false;
        }

        function disableOrderMode() {
            document.getElementById('orderMode').classList.add('locked');
            document.getElementById('orderMode').disabled = true;
        }

        function setMode(mode) {
            if (mode === 'order' && !isZhaoYuUnlocked) {
                alert('🔒 顺序模式尚未解锁！请先完成赵宇真爱粉测试并获得满分，或联系管理员添加白名单ID');
                return;
            }
            isRandomMode = (mode === 'random');
            document.getElementById('randomMode').classList.toggle('active', isRandomMode);
            document.getElementById('orderMode').classList.toggle('active', !isRandomMode);
        }

        // ======================错题本地存储======================
        function loadErrorCountsFromStorage(examFile) {
            const key = ERROR_STORAGE_PREFIX + examFile;
            const stored = localStorage.getItem(key);
            if (stored) {
                try { errorCounts = JSON.parse(stored); } catch (e) { errorCounts = {}; }
            } else {
                errorCounts = {};
            }
        }

        function saveErrorCountsToStorage() {
            if (!currentExamFile) return;
            const key = ERROR_STORAGE_PREFIX + currentExamFile;
            localStorage.setItem(key, JSON.stringify(errorCounts));
        }

        // ======================题库加载（强制根路径+鉴权）======================
        async function loadSelectedExam() {
            isZYBuiltExam = false;
            const selector = document.getElementById('examSelector');
            const filePath = selector.value;
            if (!filePath) {
                alert('请先选择一套题库！');
                return;
            }

            currentExamFile = filePath;
            loadErrorCountsFromStorage(currentExamFile);

            document.getElementById('loading').style.display = 'block';
            document.getElementById('examContainer').style.display = 'none';

            try {
                let response;

                if (filePath === 'ceshi/data/zy.json') {
                    // 赵宇题库：先获取Token，再携带Token加载
                    isZYBuiltExam = true;
                    const tokenOk = await getExamToken();
                    if (!tokenOk) {
                        throw new Error('获取访问凭证失败，请刷新页面重试');
                    }
                    response = await fetch(`/api/get-zy-exam?token=${encodeURIComponent(examToken)}&userId=${encodeURIComponent(userLocalId)}`);
                } else {
                    // 其他解锁题库，保持原有加载方式
                    isZYBuiltExam = false;
                    const requestUrl = `/${filePath}?userId=${encodeURIComponent(userLocalId)}`;
                    response = await fetch(requestUrl);
                }

                if (!response.ok) {
                    let errMsg = `加载失败（状态码：${response.status}）`;
                    try {
                        const err = await response.json();
                        errMsg = err.msg || errMsg;
                    } catch(e) {}
                    throw new Error(errMsg);
                }

                currentExamData = await response.json();
                examStartTime = Date.now();
                resetBehaviorData(); // 重置行为数据

                document.querySelector('h1').textContent = `📚 ${currentExamData.examTitle || '在线测试系统'}`;
                renderAllQuestions();
                document.getElementById('loading').style.display = 'none';
                document.getElementById('examContainer').style.display = 'block';
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } catch (error) {
                alert('加载题库失败：' + error.message);
                document.getElementById('loading').style.display = 'none';
            }
        }


        function renderAllQuestions() {
            if (!currentExamData) return;
            renderChoiceQuestions();
            renderJudgeQuestions();
            renderFillQuestions();
            renderEssayQuestions();
        }

        function shuffleIfRandom(array) {
            if (isRandomMode) {
                return [...array].sort(() => Math.random() - 0.5);
            }
            return [...array];
        }

        // ======================错题计数======================
        function updateErrorDisplay(errorId) {
            const displayEl = document.querySelector(`[data-error-id="${errorId}"]`);
            if (displayEl) {
                const count = errorCounts[errorId] || 0;
                if (count > 0) {
                    displayEl.textContent = `❌ 错误 ${count} 次`;
                    displayEl.style.display = 'inline-block';
                } else {
                    displayEl.style.display = 'none';
                }
            }
        }

        function incrementError(errorId) {
            if(currentExamFile === 'ceshi/data/zy.json' && !isZhaoYuUnlocked){
                return;
            }
            if (!errorCounts[errorId]) {
                errorCounts[errorId] = 0;
            }
            errorCounts[errorId]++;
            updateErrorDisplay(errorId);
            saveErrorCountsToStorage();
        }

        function resetAllErrors() {
            for (let key in errorCounts) {
                errorCounts[key] = 0;
                updateErrorDisplay(key);
            }
            saveErrorCountsToStorage();
        }

        function resetSectionErrors(type) {
            const prefix = type === 'choice' ? 'choice-' : 'judge-';
            for (let key in errorCounts) {
                if (key.startsWith(prefix)) {
                    errorCounts[key] = 0;
                    updateErrorDisplay(key);
                }
            }
            saveErrorCountsToStorage();
        }

        // ======================选择题渲染======================
        function renderChoiceQuestions() {
            const container = document.getElementById('choice-questions');
            container.innerHTML = '';
            if (!currentExamData.choiceQuestions) return;

            let questions = currentExamData.choiceQuestions;
            questions = shuffleIfRandom(questions);

            questions.forEach((q, index) => {
                const questionDiv = document.createElement('div');
                questionDiv.className = 'question';
                questionDiv.dataset.questionId = q.id;

                const header = document.createElement('div');
                header.className = 'question-header';
                const questionText = document.createElement('div');
                questionText.className = 'question-text';
                // 内置赵宇题库全部强制多选，外部题库按answer自动判断
const isMultiple = isZYBuiltExam ? true : Array.isArray(q.answer);

                const questionType = isMultiple ? '【多选】' : '【单选】';
                questionText.innerHTML = `${index + 1}. ${questionType} ${q.question}`;
                header.appendChild(questionText);

                const errorId = `choice-${q.id}`;
                const errorCount = errorCounts[errorId] || 0;
                const errorDisplay = document.createElement('span');
                errorDisplay.className = 'error-count-display';
                errorDisplay.dataset.errorId = errorId;
                if (errorCount > 0) {
                    errorDisplay.textContent = `❌ 错误 ${errorCount} 次`;
                } else {
                    errorDisplay.style.display = 'none';
                }
                header.appendChild(errorDisplay);
                questionDiv.appendChild(header);

                const optionsDiv = document.createElement('div');
                optionsDiv.className = 'options';
                const options = shuffleIfRandom(q.options);
                const originalIndexMap = new Map();
                options.forEach((option, shuffledIdx) => {
                    const originalIdx = q.options.indexOf(option);
                    originalIndexMap.set(shuffledIdx, originalIdx);
                });

                options.forEach((option, optIndex) => {
    const optionDiv = document.createElement('div');
    optionDiv.className = 'option';
    optionDiv.dataset.index = optIndex;
    // 新增：存原始选项索引（关键）
    optionDiv.dataset.originalIndex = originalIndexMap.get(optIndex);


                    const label = document.createElement('label');
                    label.textContent = ` ${String.fromCharCode(65 + optIndex)}. ${option}`;

                    const feedback = document.createElement('span');
                    feedback.className = 'feedback';

                    optionDiv.appendChild(label);
                    optionDiv.appendChild(feedback);

                    if (isMultiple) {
                        optionDiv.addEventListener('click', function(e) {
                            if (questionDiv.classList.contains('answered')) return;
                            this.classList.toggle('selected');
                        });
                    } else {
                        optionDiv.addEventListener('click', function(e) {
                            if (questionDiv.classList.contains('answered')) return;
                            questionDiv.classList.add('answered');
                            optionsDiv.querySelectorAll('.option').forEach(opt => {
                                opt.classList.add('answered');
                            });

                            const selectedShuffledIndex = parseInt(this.dataset.index);
                            const selectedOriginalIndex = originalIndexMap.get(selectedShuffledIndex);
                            const isCorrect = selectedOriginalIndex === q.answer;

                            optionsDiv.querySelectorAll('.option').forEach(opt => {
                                opt.classList.remove('selected', 'wrong');
                                opt.querySelector('.feedback').textContent = '';
                            });

                            if (isCorrect) {
                                this.classList.add('selected');
                                this.querySelector('.feedback').textContent = '✓ 正确';
                                this.querySelector('.feedback').className = 'feedback correct-feedback';
                                checkZhaoYuPerfectScore();
                            } else {
                                incrementError(errorId);
                                this.classList.add('wrong');
                                this.querySelector('.feedback').textContent = '✗ 错误';
                                this.querySelector('.feedback').className = 'feedback wrong-feedback';

                                optionsDiv.querySelectorAll('.option').forEach(opt => {
                                    const shuffledIdx = parseInt(opt.dataset.index);
                                    const originalIdx = originalIndexMap.get(shuffledIdx);
                                    if (originalIdx === q.answer) {
                                        opt.classList.add('selected');
                                        opt.querySelector('.feedback').textContent = '✓ 正确答案';
                                        opt.querySelector('.feedback').className = 'feedback correct-feedback';
                                    }
                                });
                                handleZhaoYuWrongAnswer();
                            }
                        });
                    }

                    optionsDiv.appendChild(optionDiv);
                });

                if (isMultiple) {
                    // 多选题选中数量提示
const selectTip = document.createElement('div');
selectTip.className = 'select-tip';
selectTip.textContent = '已选择：0 项';

const confirmBtn = document.createElement('button');
confirmBtn.className = 'confirm-btn';
confirmBtn.textContent = '确认选择';

// 点击选项实时更新选中数量
optionsDiv.addEventListener('click', function() {
    const selectedNum = optionsDiv.querySelectorAll('.option.selected').length;
    selectTip.textContent = `已选择：${selectedNum} 项`;
});

questionDiv.appendChild(selectTip);
questionDiv.appendChild(confirmBtn);

                    confirmBtn.addEventListener('click', async function() {
                        if (questionDiv.classList.contains('answered')) return;

                        const selectedOptions = optionsDiv.querySelectorAll('.option.selected');
                        if (selectedOptions.length === 0) {
                            alert('请至少选择一个选项！');
                            return;
                        }

                        recordClick(); // 记录点击行为

                        questionDiv.classList.add('answered');
                        optionsDiv.querySelectorAll('.option').forEach(opt => {
                            opt.classList.add('answered');
                        });

                        const selectedIndices = Array.from(selectedOptions).map(opt => {
                            const shuffledIdx = parseInt(opt.dataset.index);
                            return originalIndexMap.get(shuffledIdx);
                        }).sort();

                        let isCorrect;

                        if (isZYBuiltExam) {
                            // 赵宇题库：调用服务端验证答案
                            confirmBtn.textContent = '验证中...';
                            confirmBtn.disabled = true;
                            isCorrect = await checkSingleAnswer(q.id, 'choice', selectedIndices);
                            if (isCorrect === null) {
                                alert('答案验证失败，请检查网络后重试');
                                questionDiv.classList.remove('answered');
                                optionsDiv.querySelectorAll('.option').forEach(opt => {
                                    opt.classList.remove('answered');
                                });
                                confirmBtn.textContent = '确认选择';
                                confirmBtn.disabled = false;
                                return;
                            }
                        } else {
                            // 外部题库：前端直接判断
                            const correctAnswers = [...q.answer].sort();
                            isCorrect = JSON.stringify(selectedIndices) === JSON.stringify(correctAnswers);
                        }

                        optionsDiv.querySelectorAll('.option').forEach(opt => {
                            opt.classList.remove('selected', 'wrong');
                            opt.querySelector('.feedback').textContent = '';
                        });

                        if (isCorrect) {
                            selectedOptions.forEach(opt => {
                                opt.classList.add('selected');
                                opt.querySelector('.feedback').textContent = '✓ 正确';
                                opt.querySelector('.feedback').className = 'feedback correct-feedback';
                            });
                            checkZhaoYuPerfectScore();
                        } else {
                            incrementError(errorId);
                            selectedOptions.forEach(opt => {
                                opt.classList.add('wrong');
                                opt.querySelector('.feedback').textContent = '✗ 错误';
                                opt.querySelector('.feedback').className = 'feedback wrong-feedback';
                            });

                            // 外部题库显示正确答案，赵宇题库不显示（答错直接重来）
                            if (!isZYBuiltExam) {
                                const correctAnswers = [...q.answer].sort();
                                optionsDiv.querySelectorAll('.option').forEach(opt => {
                                    const shuffledIdx = parseInt(opt.dataset.index);
                                    const originalIdx = originalIndexMap.get(shuffledIdx);
                                    if (correctAnswers.includes(originalIdx)) {
                                        opt.classList.add('selected');
                                        opt.querySelector('.feedback').textContent = '✓ 正确答案';
                                        opt.querySelector('.feedback').className = 'feedback correct-feedback';
                                    }
                                });
                            }

                            handleZhaoYuWrongAnswer();
                        }
                    });
                    questionDiv.appendChild(confirmBtn);
                }

                questionDiv.appendChild(optionsDiv);
                container.appendChild(questionDiv);
            });
        }

        // ======================赵宇测试防错逻辑======================
        function handleZhaoYuWrongAnswer() {
            if (currentExamFile === 'ceshi/data/zy.json' && !isZhaoYuUnlocked) {
                const anyWrong = document.querySelectorAll('.option.wrong').length > 0;
                if (anyWrong) {
                    alert('❌ 答错了！赵宇测试需要满分才能解锁其他题库。即将重新开始...');
                    resetCurrentExamState();
                    loadSelectedExam();
                }
            }
        }

        function resetCurrentExamState() {
            document.querySelectorAll('.question.answered').forEach(el => el.classList.remove('answered'));
            document.querySelectorAll('.option.selected, .option.wrong, .option.answered').forEach(el => {
                el.classList.remove('selected', 'wrong', 'answered');
                const feedback = el.querySelector('.feedback');
                if (feedback) feedback.textContent = '';
            });
            document.querySelectorAll('input:disabled').forEach(el => el.disabled = false);
        }

        // ======================服务端判分解锁核心（按题目ID提交）======================
        async function checkZhaoYuPerfectScore() {
            if (currentExamFile !== 'ceshi/data/zy.json' || isZhaoYuUnlocked) return;

            const choiceQuestions = document.querySelectorAll('#choice-questions .question');
            const judgeQuestions = document.querySelectorAll('#judge-questions .question');

            // 判断是否全部答完
            const choiceAllAnswered = choiceQuestions.length > 0 
                && Array.from(choiceQuestions).every(q => q.classList.contains('answered'));
            const judgeAllAnswered = judgeQuestions.length === 0 
                || Array.from(judgeQuestions).every(q => q.classList.contains('answered'));

            if (!choiceAllAnswered || !judgeAllAnswered) return;

            // 收集选择题答案：key=题目ID，value=用户选项
            const choiceAnswers = {};
            choiceQuestions.forEach(q => {
                const qId = q.dataset.questionId;
                const options = q.querySelectorAll('.option');
                const selected = [];
options.forEach((opt) => {
    if (opt.classList.contains('selected') && !opt.querySelector('.feedback')?.textContent.includes('正确答案')) {
        // 读原始索引，不是显示位置索引
        selected.push(parseInt(opt.dataset.originalIndex));
    }
});

                choiceAnswers[qId] = selected.length === 1 ? selected[0] : selected;
            });

            // 收集判断题答案：key=题目ID，value=布尔值
            const judgeAnswers = {};
            judgeQuestions.forEach(q => {
                const qId = q.dataset.questionId;
                const options = q.querySelectorAll('.option');
                options.forEach(opt => {
                    if (opt.classList.contains('selected')) {
                        judgeAnswers[qId] = opt.dataset.correct === 'true';
                    }
                });
            });

            // 提交服务端判分
            try{
                const res = await fetch('/api/submit-score', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: userLocalId,
                        choiceAnswers,
                        judgeAnswers,
                        startTime: examStartTime,
                        behaviorData: behaviorData
                    })
                });
                const data = await res.json();

                if (data.code === 200) {
    if(data.isUnlocked){
        isZhaoYuUnlocked = true;
        unlockOtherExams();
        enableOrderMode();
        alert(`🎉 ${data.msg}\n得分：${data.score}`);
    } else {
        alert(`😢 ${data.msg}\n得分：${data.score}`);
    }
} else if (data.code === 400 || data.code === 429) {
    alert(`⚠️ ${data.msg}`);
}

            }catch(e){
                console.log("提交判分失败",e);
            }
        }

        // ======================判断题渲染======================
        function renderJudgeQuestions() {
            const container = document.getElementById('judge-questions');
            container.innerHTML = '';
            if (!currentExamData.judgeQuestions) return;

            let questions = currentExamData.judgeQuestions;
            const judgeOptions = ["√ 正确", "× 错误"];
            questions = shuffleIfRandom(questions);

            questions.forEach((q, index) => {
                const questionDiv = document.createElement('div');
                questionDiv.className = 'question';
                questionDiv.dataset.questionId = q.id;

                const header = document.createElement('div');
                header.className = 'question-header';
                const questionText = document.createElement('div');
                questionText.className = 'question-text';
                questionText.innerHTML = `${index + 1}. ${q.question}`;
                header.appendChild(questionText);

                const errorId = `judge-${q.id}`;
                const errorCount = errorCounts[errorId] || 0;
                const errorDisplay = document.createElement('span');
                errorDisplay.className = 'error-count-display';
                errorDisplay.dataset.errorId = errorId;
                if (errorCount > 0) {
                    errorDisplay.textContent = `❌ 错误 ${errorCount} 次`;
                } else {
                    errorDisplay.style.display = 'none';
                }
                header.appendChild(errorDisplay);
                questionDiv.appendChild(header);

                const optionsDiv = document.createElement('div');
                optionsDiv.className = 'options';
                const options = shuffleIfRandom(judgeOptions);

                options.forEach((option, optIndex) => {
                    const optionDiv = document.createElement('div');
                    optionDiv.className = 'option';
                    const isThisOptionTrue = option.startsWith('√');
                    optionDiv.dataset.correct = (isThisOptionTrue === q.answer);

                    const radio = document.createElement('input');
                    radio.type = 'radio';
                    radio.name = `judge-${q.id}`;
                    radio.id = `judge-${q.id}-opt${optIndex}`;
                    const label = document.createElement('label');
                    label.htmlFor = `judge-${q.id}-opt${optIndex}`;
                    label.textContent = ` ${option}`;
                    const feedback = document.createElement('span');
                    feedback.className = 'feedback';
                    optionDiv.appendChild(radio);
                    optionDiv.appendChild(label);
                    optionDiv.appendChild(feedback);

                    optionDiv.addEventListener('click', function() {
                        if (questionDiv.classList.contains('answered')) return;
                        questionDiv.classList.add('answered');
                        optionsDiv.querySelectorAll('.option').forEach(opt => {
                            opt.classList.add('answered');
                            opt.querySelector('input').disabled = true;
                        });

                        const isCorrect = this.dataset.correct === 'true';
                        const allOptions = this.parentElement.querySelectorAll('.option');
                        allOptions.forEach(opt => {
                            opt.classList.remove('selected', 'wrong');
                            opt.querySelector('.feedback').textContent = '';
                        });

                        if (isCorrect) {
                            this.classList.add('selected');
                            this.querySelector('.feedback').textContent = '✓ 正确';
                            this.querySelector('.feedback').className = 'feedback correct-feedback';
                            checkZhaoYuPerfectScore();
                        } else {
                            incrementError(errorId);
                            this.classList.add('wrong');
                            this.querySelector('.feedback').textContent = '✗ 错误';
                            this.querySelector('.feedback').className = 'feedback wrong-feedback';
                            allOptions.forEach(opt => {
                                const optIsTrue = opt.querySelector('label').textContent.includes('√');
                                if (optIsTrue === q.answer) {
                                    opt.classList.add('selected');
                                    opt.querySelector('.feedback').textContent = '✓ 正确答案';
                                    opt.querySelector('.feedback').className = 'feedback correct-feedback';
                                }
                            });
                            handleZhaoYuWrongAnswer();
                        }
                    });

                    optionsDiv.appendChild(optionDiv);
                });

                questionDiv.appendChild(optionsDiv);
                container.appendChild(questionDiv);
            });
        }

        // ======================填空题渲染======================
        function renderFillQuestions() {
            const container = document.getElementById('fill-questions');
            container.innerHTML = '';
            if (!currentExamData.fillQuestions) return;

            const questions = shuffleIfRandom(currentExamData.fillQuestions);

            questions.forEach((q, index) => {
                const questionDiv = document.createElement('div');
                questionDiv.className = 'question';
                const questionText = document.createElement('div');
                questionText.className = 'question-text';
                questionText.innerHTML = `${index + 1}. ${q.question}`;
                questionDiv.appendChild(questionText);

                const btn = document.createElement('button');
                btn.className = 'toggle-answer-btn';
                btn.textContent = '显示答案';
                const answerDiv = document.createElement('div');
                answerDiv.className = 'answer-area';
                const answer = Array.isArray(q.answer) ? q.answer.join('、') : q.answer;
                answerDiv.innerHTML = `<strong>参考答案：</strong>${answer}`;

                btn.onclick = function() {
                    if (answerDiv.style.display === 'block') {
                        answerDiv.style.display = 'none';
                        btn.textContent = '显示答案';
                    } else {
                        answerDiv.style.display = 'block';
                        btn.textContent = '隐藏答案';
                    }
                };

                questionDiv.appendChild(btn);
                questionDiv.appendChild(answerDiv);
                container.appendChild(questionDiv);
            });
        }

        // ======================简答题渲染======================
        function renderEssayQuestions() {
            const container = document.getElementById('essay-questions');
            container.innerHTML = '';
            if (!currentExamData.essayQuestions) return;

            const questions = shuffleIfRandom(currentExamData.essayQuestions);

            questions.forEach((q, index) => {
                const questionDiv = document.createElement('div');
                questionDiv.className = 'question';
                const questionText = document.createElement('div');
                questionText.className = 'question-text';
                questionText.innerHTML = `${index + 1}. ${q.question}`;
                questionDiv.appendChild(questionText);

                const btn = document.createElement('button');
                btn.className = 'toggle-answer-btn';
                btn.textContent = '显示参考答案';
                const answerDiv = document.createElement('div');
                answerDiv.className = 'answer-area';
                answerDiv.innerHTML = `<strong>参考答案：</strong>\n${q.answer}`;

                btn.onclick = function() {
                    if (answerDiv.style.display === 'block') {
                        answerDiv.style.display = 'none';
                        btn.textContent = '显示参考答案';
                    } else {
                        answerDiv.style.display = 'block';
                        btn.textContent = '隐藏参考答案';
                    }
                };

                questionDiv.appendChild(btn);
                questionDiv.appendChild(answerDiv);
                container.appendChild(questionDiv);
            });
        }

        // ======================页面初始化======================
        document.addEventListener('DOMContentLoaded', async function() {
            // 微信浏览器检测：命中则显示提示，终止后续初始化
            if (isWeChatBrowser()) {
                showWeChatTip();
                return;
            }

            initLocalUserId();
            bindShowIdButton();
            await checkUnlockFromServer();

            setTimeout(() => {
                if (isZhaoYuUnlocked) {
                    showNotification('unlock');
                } else {
                    showNotification('locked');
                }
            }, 2000);
        });

        // 反调试
        !function(){
            function antiDebug(){
                debugger;
                setTimeout(antiDebug,500)
            }
            antiDebug()
        }();
