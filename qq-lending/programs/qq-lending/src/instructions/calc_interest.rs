use anchor_lang::prelude::*;

const YEAR_IN_SECONDS: u64 = 31_536_000;
const WAD: u128 = 1_000_000_000_000_000_000; // 1e18 精度

pub fn calculate_accrued_interest(
    deposited: u64,
    annual_interest_rate: u64, // 年化利率，定点数 (1e18 = 100%)
    last_update: i64,
) -> Result<u64> {
    let current_time = Clock::get()?.unix_timestamp;
    let time_elapsed = (current_time - last_update) as u64;

    // 转成 u128 防止溢出
    let deposited_u128 = deposited as u128;
    let rate_u128 = annual_interest_rate as u128;
    let time_u128 = time_elapsed as u128;

    // 利息部分 = P * r * t / YEAR
    let interest = deposited_u128
        .checked_mul(rate_u128)
        .unwrap()
        .checked_mul(time_u128)
        .unwrap()
        / (WAD * YEAR_IN_SECONDS as u128);

    let new_value = deposited_u128.checked_add(interest).unwrap();

    Ok(new_value as u64)
}
