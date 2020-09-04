const { expectRevert } = require('@openzeppelin/test-helpers');
const WasabiToken = artifacts.require('WasabiToken');

contract('WasabiToken', ([alice, bob, carol]) => {
    beforeEach(async () => {
        this.wasabi = await WasabiToken.new({ from: alice });
    });

    it('should have correct name and symbol and decimal', async () => {
        const name = await this.wasabi.name();
        const symbol = await this.wasabi.symbol();
        const decimals = await this.wasabi.decimals();
        assert.equal(name.valueOf(), 'WasabiToken');
        assert.equal(symbol.valueOf(), 'WASABI');
        assert.equal(decimals.valueOf(), '18');
    });

    it('should only allow owner to mint token', async () => {
        await this.wasabi.mint(alice, '100', { from: alice });
        await this.wasabi.mint(bob, '1000', { from: alice });
        await expectRevert(
            this.wasabi.mint(carol, '1000', { from: bob }),
            'Ownable: caller is not the owner',
        );
        const totalSupply = await this.wasabi.totalSupply();
        const aliceBal = await this.wasabi.balanceOf(alice);
        const bobBal = await this.wasabi.balanceOf(bob);
        const carolBal = await this.wasabi.balanceOf(carol);
        assert.equal(totalSupply.valueOf(), '1100');
        assert.equal(aliceBal.valueOf(), '100');
        assert.equal(bobBal.valueOf(), '1000');
        assert.equal(carolBal.valueOf(), '0');
    });

    it('should supply token transfers properly', async () => {
        await this.wasabi.mint(alice, '100', { from: alice });
        await this.wasabi.mint(bob, '1000', { from: alice });
        await this.wasabi.transfer(carol, '10', { from: alice });
        await this.wasabi.transfer(carol, '100', { from: bob });
        const totalSupply = await this.wasabi.totalSupply();
        const aliceBal = await this.wasabi.balanceOf(alice);
        const bobBal = await this.wasabi.balanceOf(bob);
        const carolBal = await this.wasabi.balanceOf(carol);
        assert.equal(totalSupply.valueOf(), '1100');
        assert.equal(aliceBal.valueOf(), '90');
        assert.equal(bobBal.valueOf(), '900');
        assert.equal(carolBal.valueOf(), '110');
    });

    it('should fail if you try to do bad transfers', async () => {
        await this.wasabi.mint(alice, '100', { from: alice });
        await expectRevert(
            this.wasabi.transfer(carol, '110', { from: alice }),
            'ERC20: transfer amount exceeds balance',
        );
        await expectRevert(
            this.wasabi.transfer(carol, '1', { from: bob }),
            'ERC20: transfer amount exceeds balance',
        );
    });
  });
