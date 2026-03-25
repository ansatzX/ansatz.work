# 2025-02-01

We have a two-state system, which has a continuous degree of freedom q, associated a potential energy function V(q) with two separate minima.

This potential energy function, of course, have one barrier V0. Two minima note as ω+ and ω−

We assume that V0 is much bigger than ℏω0. And ω0 is of the order of ω+ and ω−.

The energy gap between ground state and first excited state is ℏω+ or ℏω−

The energy difference of two ground state is ϵ, which is much smaller than ℏω0

And kBT≪ℏω0, means that system is strictly located in the two-dimension Hilbert Space spanned by two ground states. In one word, here is no tunneling.

Now, we introduce a matrix element ℏΔ0, which is exponentially smaller than ℏω0, ℏΔ0≪ℏω0. With condition ℏω0≪V(0), so that we make sure tunneling process does not involve excited states.

For all systems, degree of freedom q can be or not be geometrical.

I am confused that what's V(q)? For a non-geometrical freedom described system, how to draw the curve? We have energy level, how the smooth curve occurred?

Of course, actual systems have many dimension which is more than two. But we can truncate them to be two. These systems can be described by an extended coordinate, as "truncated" two-state systems.

Now, we have isolated hamiltonian terms H= -1/2ℏΔ0σx+1/2 ϵσz

And, it is equivalent to a particle of spin-1/2 in a magnetic field, H=−ϵz^+ℏΔ0x^, with eigenvalues ±ϵ2+(ℏΔ0)2.

We can tell dynamic of σz is sensitive only to the ratio ℏΔ0ϵ.

- ratio is small, system is located in one well
- ratio is large, eigenstates are appreciably delocalized in q

For ϵ is zero, we define P(t)=PR−PL, P is the probability of finding the system in the right (left) well.

We have P(t)=cosΔ0t

ψR,ψL may relate to some symmetry operation, which hamiltonian commuted. Fluctuating symmetry breaking due to contact with a quantum environment is much important.

Now, the isolated system can be completely described. We know each two-state system interacts with environment.

So, we add coupling term ΔzΩ^, Ω^ is operator of the environment In other word, we add coupling with σz and the environment can "observe" the value of σz.

We still have σx,σy, why we write σz term only? Here lies many case involved x and y.

The reason is that σx and σy have only non-diagonal matrix elements in the σz representation. Operator with only non-diagonal element do exchange |0⟩,|1⟩, σz do not change basis. Or, we can say σx,σy only change basis, while σz can change eigenvalue.

It's a confusing statement, whatever only add coupling with σz, maybe need python and @Weitang_Li

For tunneling, one change ψL to ψR. The important interaction must be proportional to the overlap of ψL and ψR in the real coordinate space. And the interactions must be of order of ℏΔ0, which means that interaction must make tunneling happen.

From smart people's conclusion, we know σz should be coupled to environment. And one points out that system should not only couple one degree of environment. Here comes out a way that we represent environment as a set of harmonic oscillators with a coupling linear in the oscillator coordinates and/or momenta.

So we get a complete hamiltonian HSB=-1/2Δσx+1/2ϵσz+∑α( 1/2mαω2α xα+p2α/2mα)+1/2q0σz∑αCαxα

we should note that:

- Δ is tunneling matrix element, but with limited number oscillators, this should a efficient one. which is renormalized for higher-frequency effects.
- q0 may refer to distance in two-well diagram, also can be a part of coupling,for a intrinsically two-state system q0 is meaningless,
- Cα is linear coupling of α th oscillator

We now define a spectral function J(ω)=π/2 ∑( C2α/mαωα ) δ(ω-ωα)

We say that spectral function is full description of effect of environment.

It is hard to explain clearly, which needs a lot pre-reading. But we can roughly say that equilibrium statistical average over initial states of environment and sum over final states are taken to compress information into spectral function.

One may ask ChatGPT or DeepSeek to get compete answer.

Whatever, now we can define this model with three terms Δ,ϵ,J(ω)

The form of spectral function can be from equation of motions or microscope knowledge.

One assumption is J(ω) is a reasonably smooth function of ω.

When it has the form ωs, ω up to ωc, ωc≫Δ. Also for a natural two-state system, ωc can be a cutoff from a truncation procedure.
