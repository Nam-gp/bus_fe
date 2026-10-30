import { FormControl } from '@angular/forms';
import { VnValidators } from '@shared/validators/vn.validators';

describe('validate số điện thoại bán vé', () => {
  it('chấp nhận đúng 10 chữ số bắt đầu bằng 0', () => expect(VnValidators.soDienThoai(new FormControl('0901234567'))).toBeNull());
  it('từ chối số điện thoại sai', () => expect(VnValidators.soDienThoai(new FormControl('901234567'))).toEqual({ soDienThoai: true }));
});
