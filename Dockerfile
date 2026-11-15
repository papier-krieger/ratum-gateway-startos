FROM rust:1-bookworm AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    pkg-config libssl-dev ca-certificates git \
    && rm -rf /var/lib/apt/lists/*

# Upstream iohzrd/ratum pinned to 0.1.54 so the build is reproducible.
ARG RATUM_REV=cf1813d9463d9d65e851e8ff64d76c0ac28cf480

WORKDIR /build
RUN git init -q . \
 && git remote add origin https://github.com/iohzrd/ratum.git \
 && git fetch -q --depth 1 origin ${RATUM_REV} \
 && git checkout -q FETCH_HEAD \
 && sed -i 's/features = \["https"\]/features = ["https-rustls-probe"]/' Cargo.toml \
 && grep -q 'https-rustls-probe' Cargo.toml \
 && grep minreq Cargo.toml
RUN cargo build --workspace --release --bin ratum-gateway

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*
COPY --from=builder /build/target/release/ratum-gateway /usr/local/bin/ratum-gateway
ENTRYPOINT ["/usr/local/bin/ratum-gateway"]
