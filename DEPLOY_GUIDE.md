# GitHub Pages 部署指南

## 方式一：通过GitHub网站手动上传（最简单）

### 步骤1：创建新仓库
1. 访问 https://github.com/new
2. 仓库名称填写：`checkin-app`
3. 选择 **Public**（公开）
4. ✅ 勾选 **Add a README file**
5. 点击 **Create repository**

### 步骤2：上传文件
1. 进入创建好的仓库页面
2. 点击 **Add file** → **Upload files**
3. 上传文件：`checkin-web.html`
4. 在 Commit message 填写：`Add checkin web app`
5. 点击 **Commit changes**

### 步骤3：启用GitHub Pages
1. 进入仓库的 **Settings** 标签
2. 左侧菜单点击 **Pages**
3. Source 选择 **Deploy from a branch**
4. Branch 选择 **main** 和 **/ (root)**
5. 点击 **Save**

### 步骤4：访问你的应用
等待1-2分钟后，访问：
```
https://你的用户名.github.io/checkin-app/checkin-web.html
```

---

## 方式二：使用GitHub Desktop（图形界面）

### 步骤1：下载安装
访问 https://desktop.github.com/ 下载并安装GitHub Desktop

### 步骤2：克隆仓库
1. 打开GitHub Desktop
2. File → Clone repository
3. 选择你刚创建的 `checkin-app` 仓库

### 步骤3：复制文件
将 `checkin-web.html` 复制到本地仓库文件夹

### 步骤4：提交并推送
1. 填写 Summary：`Add checkin web app`
2. 点击 **Commit to main**
3. 点击 **Push origin**

---

## 你的仓库信息

- 仓库名称：`checkin-app`
- 访问地址（部署后）：`https://你的用户名.github.io/checkin-app/checkin-web.html`

---

## 注意事项

1. **API Key 安全**：你的腾讯位置服务Key已写入代码中，如果是公开仓库，任何人都能看到。建议：
   - 使用GitHub Private仓库（需要付费）
   - 或者接受Key公开（风险较低，但有调用次数限制）

2. **GitHub Pages 生效时间**：通常需要1-2分钟，如果访问404，请等待几分钟再试

3. **自定义域名**（可选）：如果你想用自己的域名访问，可以在仓库Settings → Pages → Custom domain 中设置
