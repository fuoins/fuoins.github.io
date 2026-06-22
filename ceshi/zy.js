function showNotification(type) {
    // type: 'unlock' 或 'locked'
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
                无需答题即可使用全部功能
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
                需要完成「赵宇真爱粉测试」并获得满分<br>
                或者把本机ID发给管理员加入白名单解锁
            </div>
            <button class="notif-btn" onclick="this.closest('.notification').remove()">知道了</button>
        `;
    }
    
    document.body.appendChild(notif);
    
    // 5秒后自动关闭
    setTimeout(() => {
        if (notif.parentNode) {
            notif.style.animation = 'slideOut 0.5s ease-out forwards';
            setTimeout(() => notif.remove(), 500);
        }
    }, 5000);
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

// ======================全局变量区（新增白名单+用户ID配置）======================
let currentExamData = null;
let isRandomMode = true;
let currentExamFile = '';
let errorCounts = {};
let isZhaoYuUnlocked = false; // 赵宇测试是否已解锁
let zhaoYuPerfectScoreAchieved = false; // 本次赵宇测试是否已达成满分

const ERROR_STORAGE_PREFIX = 'test_error_counts_';
const UNLOCK_STORAGE_KEY = 'zhaoyu_unlocked_status';

// 白名单&本机唯一ID配置
const USER_ID_KEY = 'local_unique_user_id';
const WHITELIST_URL = 'data/whitelist.json';
let userLocalId = '';
let isWhiteListUnlocked = false;

// ======================用户ID、白名单相关函数======================
// 生成16位随机用户ID
function generateUserId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for(let i = 0; i < 16; i++){
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
}

// 初始化本机ID：无则生成存入localStorage，有则读取
function initLocalUserId(){
    let stored = localStorage.getItem(USER_ID_KEY);
    if(!stored){
        stored = generateUserId();
        localStorage.setItem(USER_ID_KEY, stored);
    }
    userLocalId = stored;
}

// 拉取白名单校验ID
async function checkWhiteListUnlock(){
    try{
        const res = await fetch(WHITELIST_URL);
        if(!res.ok) return false;
        const whiteListArr = await res.json();
        if(whiteListArr.includes(userLocalId)){
            isWhiteListUnlocked = true;
            isZhaoYuUnlocked = true;
            localStorage.setItem(UNLOCK_STORAGE_KEY, 'true');
            unlockOtherExams();
            enableOrderMode();
            return true;
        }
    }catch(e){
        console.log("白名单文件加载失败",e);
    }
    return false;
}

// 点击按钮展示本机ID绑定事件
function bindShowIdButton(){
    const idBtn = document.getElementById('showMyIdBtn');
    if(idBtn){
        idBtn.addEventListener('click',()=>{
            alert(`你的本机专属解锁ID：\n${userLocalId}\n发送给管理员加入白名单可直接解锁全部题库`);
        })
    }
}

// ======================原有解锁逻辑======================
function checkAndApplyUnlockStatus() {
    const storedUnlock = localStorage.getItem(UNLOCK_STORAGE_KEY);
    if (storedUnlock === 'true') {
        isZhaoYuUnlocked = true;
        unlockOtherExams();
        enableOrderMode();
    } else {
        lockOtherExams();
        disableOrderMode();
    }
}

function unlockOtherExams() {
    const selector = document.getElementById('examSelector');
    for (let i = 0; i < selector.options.length; i++) {
        if (selector.options[i].value && selector.options[i].value !== 'data/zy.json') {
            selector.options[i].disabled = false;
            selector.options[i].text = selector.options[i].text.replace(' (需解锁)', '');
        }
    }
}

function lockOtherExams() {
    const selector = document.getElementById('examSelector');
    for (let i = 0; i < selector.options.length; i++) {
        if (selector.options[i].value && selector.options[i].value !== 'data/zy.json') {
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
        alert('🔒 顺序模式尚未解锁！请先在随机模式下完成赵宇真爱粉测试并获得满分，或联系管理员添加白名单ID');
        return;
    }
    isRandomMode = (mode === 'random');
    document.getElementById('randomMode').classList.toggle('active', isRandomMode);
    document.getElementById('orderMode').classList.toggle('active', !isRandomMode);
}

// 错题本地存储
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

// 加载题库
async function loadSelectedExam() {
    const selector = document.getElementById('examSelector');
    const filePath = selector.value;
    if (!filePath) {
        alert('请先选择一套题库！');
        return;
    }

    if (filePath === 'data/zy.json') {
        zhaoYuPerfectScoreAchieved = false;
    }

    currentExamFile = filePath;
    loadErrorCountsFromStorage(currentExamFile);

    document.getElementById('loading').style.display = 'block';
    document.getElementById('examContainer').style.display = 'none';

    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error('文件加载失败');
        currentExamData = await response.json();
        document.querySelector('h1').textContent = `📚 ${currentExamData.examTitle || '在线测试系统'}`;
        renderAllQuestions();
        document.getElementById('loading').style.display = 'none';
        document.getElementById('examContainer').style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        alert('加载题库失败！目前题库正在制作中\n错误：' + error.message);
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

// 错题计数
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

// 渲染单选+多选题
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
        const isMultiple = Array.isArray(q.answer);
        const questionType = isMultiple ? '【多选】' : '【单选】';
        questionText.textContent = `${index + 1}. ${questionType} ${q.question}`;
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
            const confirmBtn = document.createElement('button');
            confirmBtn.className = 'confirm-btn';
            confirmBtn.textContent = '确认选择';
            confirmBtn.addEventListener('click', function() {
                if (questionDiv.classList.contains('answered')) return;
                
                const selectedOptions = optionsDiv.querySelectorAll('.option.selected');
                if (selectedOptions.length === 0) {
                    alert('请至少选择一个选项！');
                    return;
                }

                questionDiv.classList.add('answered');
                optionsDiv.querySelectorAll('.option').forEach(opt => {
                    opt.classList.add('answered');
                });

                const selectedIndices = Array.from(selectedOptions).map(opt => {
                    const shuffledIdx = parseInt(opt.dataset.index);
                    return originalIndexMap.get(shuffledIdx);
                }).sort();

                const correctAnswers = [...q.answer].sort();
                const isCorrect = JSON.stringify(selectedIndices) === JSON.stringify(correctAnswers);

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
                    optionsDiv.querySelectorAll('.option').forEach(opt => {
                        const shuffledIdx = parseInt(opt.dataset.index);
                        const originalIdx = originalIndexMap.get(shuffledIdx);
                        if (correctAnswers.includes(originalIdx)) {
                            opt.classList.add('selected');
                            opt.querySelector('.feedback').textContent = '✓ 正确答案';
                            opt.querySelector('.feedback').className = 'feedback correct-feedback';
                        }
                    });
                    handleZhaoYuWrongAnswer();
                }
            });
            questionDiv.appendChild(confirmBtn);
        }

        questionDiv.appendChild(optionsDiv);
        container.appendChild(questionDiv);
    });
}

// 赵宇测试答错直接重置
function handleZhaoYuWrongAnswer() {
    if (currentExamFile === 'data/zy.json' && !isZhaoYuUnlocked) {
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

// 检测赵宇全套满分解锁
function checkZhaoYuPerfectScore() {
    if (currentExamFile !== 'data/zy.json' || isZhaoYuUnlocked) return;
    
    const choiceAndJudgeQuestions = document.querySelectorAll('#choice-questions .question, #judge-questions .question');
    const allCJAnswered = choiceAndJudgeQuestions.length > 0 && Array.from(choiceAndJudgeQuestions).every(q => q.classList.contains('answered'));
    const anyWrong = document.querySelectorAll('.option.wrong').length > 0;
    
    if (allCJAnswered && !anyWrong) {
        isZhaoYuUnlocked = true;
        localStorage.setItem(UNLOCK_STORAGE_KEY, 'true');
        unlockOtherExams();
        enableOrderMode();
        alert('🎉 恭喜！您已满分完成赵宇真爱粉测试！\n所有其他题库和顺序模式现已解锁！');
    }
}

// 判断题渲染
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
        questionText.textContent = `${index + 1}. ${q.question}`;
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

// 填空、简答
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
        questionText.textContent = `${index + 1}. ${q.question}`;
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

// 页面初始化入口
document.addEventListener('DOMContentLoaded', async function() {
    initLocalUserId();
    bindShowIdButton();
    const whiteUnlock = await checkWhiteListUnlock();
    if(!whiteUnlock){
        checkAndApplyUnlockStatus();
    }
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

// 窗口缩小刷新防调试
let w=innerWidth,h=innerHeight;
window.addEventListener('resize',()=>{
   if(innerWidth<w||innerHeight<h)location.reload()
})
