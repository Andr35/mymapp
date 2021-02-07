# See here for image contents: https://github.com/microsoft/vscode-dev-containers/tree/v0.148.1/containers/typescript-node/.devcontainer/base.Dockerfile

# [Choice] Node.js version: 14, 12, 10
ARG VARIANT="14-buster"
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:0-${VARIANT}

# [Optional] Uncomment this section to install additional OS packages.
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
  && apt-get -y install --no-install-recommends \
  libwebkit2gtk-4.0-dev \
  build-essential \
  curl \
  wget \
  libssl-dev \
  appmenu-gtk3-module \
  libgtk-3-dev \
  squashfs-tools

# [Optional] Uncomment if you want to install an additional version of node using nvm
# ARG EXTRA_NODE_VERSION=10
# RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"

# [Optional] Uncomment if you want to install more global node packages
RUN sudo -u node npm install -g \
  @angular/cli \
  @ionic/cli \
  npm-check \
  npm-merge-driver \
  commitizen \
  standard-version

# Switch user -----------------------------------------------------------------
USER node
SHELL ["/usr/bin/zsh", "-c"]

# Intall Rust -----------------------------------------------------------------
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y \
  && echo "export PATH=$PATH:$HOME/.cargo/bin" >> ~/.zshrc \
  && source ~/.zshrc
RUN cargo install tauri-bundler --force

# Configure ZSH Shell ---------------------------------------------------------

# Configure oh-my-zsh
RUN sed -i 's/plugins=(.*)/plugins=(git rust cargo npm)/g' ~/.zshrc
# Configure powerlevel10k
ENV POWERLEVEL9K_TRANSIENT_PROMPT=always
# Install powerlevel10k
RUN git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ~/powerlevel10k \
  && echo 'source ~/powerlevel10k/powerlevel10k.zsh-theme' >>~/.zshrc
