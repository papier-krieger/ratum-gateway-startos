FROM rust:1-bookworm AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    pkg-config libssl-dev ca-certificates git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build
RUN git clone --depth 1 https://github.com/iohzrd/ratum.git . \
 && sed -i 's/features = \["https"\]/features = ["https-rustls-probe"]/' Cargo.toml \
 && grep minreq Cargo.toml
RUN cargo build --workspace --release --bin ratum-gateway

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*
COPY --from=builder /build/target/release/ratum-gateway /usr/local/bin/ratum-gateway
ENTRYPOINT ["/usr/local/bin/ratum-gateway"]
